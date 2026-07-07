from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import List, Optional
from pathlib import Path
import pandas as pd
import numpy as np
import math
import re
import os

from stock_data import get_stock_prices
from pokemon_data import get_pokemon_prices, EARLIEST_DATE, AVAILABLE_POKEMON, POKEMON_CARDS
from inflation import adjust_for_inflation
from montecarlo import run_monte_carlo

app = FastAPI(title="Pokemon vs Stocks Backtester", docs_url=None, redoc_url=None)

# Lock CORS to same-origin in production; allow localhost for dev
_ALLOWED_ORIGINS = [
    o.strip()
    for o in os.environ.get(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://localhost:8000",
    ).split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_ALLOWED_ORIGINS,
    allow_methods=["GET"],
    allow_headers=["*"],
)

# Input validation patterns
_TICKER_RE = re.compile(r"^[A-Z0-9.\-]{1,10}$")
_DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")

DIST_DIR = Path(__file__).parent.parent / "frontend" / "dist"


def calc_metrics(values):
    if len(values) < 2:
        return {"sharpe": 0, "max_drawdown": 0, "volatility": 0, "best_month": 0, "worst_month": 0}

    returns = []
    for i in range(1, len(values)):
        if values[i - 1] > 0:
            returns.append((values[i] - values[i - 1]) / values[i - 1])

    if not returns:
        return {"sharpe": 0, "max_drawdown": 0, "volatility": 0, "best_month": 0, "worst_month": 0}

    mean_r = np.mean(returns)
    std_r = np.std(returns, ddof=1) if len(returns) > 1 else 0
    annualized_return = mean_r * 12
    annualized_vol = std_r * math.sqrt(12)
    sharpe = annualized_return / annualized_vol if annualized_vol > 0 else 0

    peak = values[0]
    max_dd = 0
    for v in values:
        if v > peak:
            peak = v
        dd = (peak - v) / peak if peak > 0 else 0
        if dd > max_dd:
            max_dd = dd

    return {
        "sharpe": round(sharpe, 2),
        "max_drawdown": round(max_dd * 100, 1),
        "volatility": round(annualized_vol * 100, 1),
        "best_month": round(max(returns) * 100, 1),
        "worst_month": round(min(returns) * 100, 1),
    }


@app.get("/api/pokemon")
def list_pokemon():
    return {"pokemon": {k: v["name"] for k, v in POKEMON_CARDS.items()}}


@app.get("/api/backtest")
def backtest(
    tickers: str = Query(..., description="Comma-separated ticker symbols"),
    amount: float = Query(..., gt=0, le=1_000_000_000, description="Investment amount in USD"),
    start: str = Query(..., description="Start date YYYY-MM-DD"),
    end: str = Query(..., description="End date YYYY-MM-DD"),
    dca: Optional[float] = Query(None, ge=0, le=1_000_000, description="Monthly DCA amount (0 or null for lump sum)"),
    pokemon: str = Query("charizard", description="Pokemon card ID"),
):
    # Validate pokemon (allowlist)
    if pokemon not in POKEMON_CARDS:
        raise HTTPException(400, "Unknown pokemon")

    pokemon_name = POKEMON_CARDS[pokemon]["name"]

    # Validate and sanitize tickers
    raw_tickers = [t.strip().upper() for t in tickers.split(",") if t.strip()]
    if not raw_tickers:
        raise HTTPException(400, "At least one ticker is required")
    if len(raw_tickers) > 3:
        raise HTTPException(400, "Maximum 3 tickers allowed")
    ticker_list = []
    for t in raw_tickers:
        if not _TICKER_RE.match(t):
            raise HTTPException(400, f"Invalid ticker symbol: '{t}'")
        ticker_list.append(t)

    # Validate date format strictly
    if not _DATE_RE.match(start) or not _DATE_RE.match(end):
        raise HTTPException(400, "Dates must be in YYYY-MM-DD format")

    try:
        start_dt = pd.Timestamp(start)
        end_dt = pd.Timestamp(end)
    except Exception:
        raise HTTPException(400, "Invalid date value")

    if start_dt < pd.Timestamp(EARLIEST_DATE):
        raise HTTPException(400, f"Start date cannot be before {EARLIEST_DATE}")
    if start_dt >= end_dt:
        raise HTTPException(400, "Start date must be before end date")

    stock_dfs = {}
    warnings = []
    for ticker in ticker_list:
        df = get_stock_prices(ticker, start, end)
        if df is None or df.empty:
            raise HTTPException(404, f"No price data found for '{ticker}'. Check the ticker symbol or try a different date range.")
        actual_start = df["date"].min()
        if actual_start > start_dt:
            warnings.append(f"{ticker} data starts from {actual_start.strftime('%Y-%m-%d')}")
        stock_dfs[ticker] = df

    pokemon_df = get_pokemon_prices(pokemon, start, end)
    if pokemon_df is None or pokemon_df.empty:
        raise HTTPException(400, "No pokemon card data for this date range")

    # Normalize all date columns to the same dtype to avoid merge errors
    def normalize_dates(df):
        df = df.copy()
        df["date"] = pd.to_datetime(df["date"]).dt.tz_localize(None).astype("datetime64[ms]")
        return df

    pokemon_df = normalize_dates(pokemon_df)
    for t in stock_dfs:
        stock_dfs[t] = normalize_dates(stock_dfs[t])

    base_df = list(stock_dfs.values())[0][["date"]].copy()
    merged = base_df.sort_values("date")

    merged = pd.merge_asof(
        merged,
        pokemon_df.sort_values("date").rename(columns={"price": "pokemon_price"}),
        on="date", direction="nearest",
    )

    for ticker, df in stock_dfs.items():
        merged = pd.merge_asof(
            merged.sort_values("date"),
            df.sort_values("date").rename(columns={"price": f"{ticker}_price"}),
            on="date", direction="nearest",
        )

    merged = merged.dropna()
    if merged.empty:
        raise HTTPException(400, "No overlapping data for this date range")

    is_dca = dca is not None and dca > 0
    monthly_contrib = dca if is_dca else 0

    pokemon_start = merged.iloc[0]["pokemon_price"]
    stock_starts = {t: merged.iloc[0][f"{t}_price"] for t in ticker_list}

    series = []
    pokemon_units = amount / pokemon_start if pokemon_start > 0 else 0
    stock_units = {t: amount / stock_starts[t] if stock_starts[t] > 0 else 0 for t in ticker_list}
    total_invested = amount

    for idx, (_, row) in enumerate(merged.iterrows()):
        if is_dca and idx > 0:
            total_invested += monthly_contrib
            if row["pokemon_price"] > 0:
                pokemon_units += monthly_contrib / row["pokemon_price"]
            for t in ticker_list:
                if row[f"{t}_price"] > 0:
                    stock_units[t] += monthly_contrib / row[f"{t}_price"]

        point = {
            "date": row["date"].strftime("%Y-%m-%d"),
            "pokemon": round(pokemon_units * row["pokemon_price"], 2),
        }
        for t in ticker_list:
            point[t] = round(stock_units[t] * row[f"{t}_price"], 2)
        series.append(point)

    final = series[-1]

    assets = {}
    pokemon_values = [p["pokemon"] for p in series]
    assets["pokemon"] = {
        "label": pokemon_name,
        "final_value": final["pokemon"],
        "return_pct": round((final["pokemon"] - total_invested) / total_invested * 100, 2),
        "metrics": calc_metrics(pokemon_values),
    }

    for t in ticker_list:
        stock_values = [p[t] for p in series]
        assets[t] = {
            "label": t,
            "final_value": final[t],
            "return_pct": round((final[t] - total_invested) / total_invested * 100, 2),
            "metrics": calc_metrics(stock_values),
        }

    all_finals = {k: v["final_value"] for k, v in assets.items()}
    winner = max(all_finals, key=all_finals.get)

    inflation_series = adjust_for_inflation(series)
    inflation_final = inflation_series[-1]
    inflation_assets = {}
    for key, asset in assets.items():
        col = "pokemon" if key == "pokemon" else key
        inf_final = inflation_final[col]
        inflation_assets[key] = {
            "final_value": inf_final,
            "return_pct": round((inf_final - total_invested) / total_invested * 100, 2),
        }

    mc_keys = ["pokemon"] + ticker_list
    monte_carlo = run_monte_carlo(series, mc_keys)

    return {
        "pokemon": pokemon,
        "pokemon_name": pokemon_name,
        "tickers": ticker_list,
        "amount": amount,
        "total_invested": total_invested,
        "dca": monthly_contrib,
        "start": start,
        "end": end,
        "series": series,
        "assets": assets,
        "winner": winner,
        "inflation_series": inflation_series,
        "inflation_assets": inflation_assets,
        "monte_carlo": monte_carlo,
        "warnings": warnings,
    }


if DIST_DIR.exists():
    assets_dir = DIST_DIR / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api"):
            raise HTTPException(404, "Not found")
        # Resolve and verify the path stays inside DIST_DIR (prevents path traversal)
        try:
            resolved = (DIST_DIR / full_path).resolve()
            resolved.relative_to(DIST_DIR.resolve())
        except (ValueError, Exception):
            raise HTTPException(400, "Invalid path")
        if resolved.exists() and resolved.is_file():
            return FileResponse(resolved)
        index = DIST_DIR / "index.html"
        if index.exists():
            return FileResponse(index)
        raise HTTPException(503, "Frontend not built")

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import List, Optional
from pathlib import Path
import pandas as pd
import numpy as np
import math

from stock_data import get_stock_prices
from pokemon_data import get_charizard_prices, EARLIEST_DATE
from inflation import adjust_for_inflation
from montecarlo import run_monte_carlo

app = FastAPI(title="Pokemon vs Stocks Backtester")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

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


@app.get("/api/backtest")
def backtest(
    tickers: str = Query(..., description="Comma-separated ticker symbols"),
    amount: float = Query(..., gt=0, description="Investment amount in USD"),
    start: str = Query(..., description="Start date YYYY-MM-DD"),
    end: str = Query(..., description="End date YYYY-MM-DD"),
    dca: Optional[float] = Query(None, ge=0, description="Monthly DCA amount (0 or null for lump sum)"),
):
    ticker_list = [t.strip().upper() for t in tickers.split(",") if t.strip()]
    if not ticker_list:
        raise HTTPException(400, "At least one ticker is required")
    if len(ticker_list) > 3:
        raise HTTPException(400, "Maximum 3 tickers allowed")

    start_dt = pd.Timestamp(start)
    end_dt = pd.Timestamp(end)

    if start_dt < pd.Timestamp(EARLIEST_DATE):
        raise HTTPException(400, f"Start date cannot be before {EARLIEST_DATE} (Charizard release)")
    if start_dt >= end_dt:
        raise HTTPException(400, "Start date must be before end date")

    stock_dfs = {}
    for ticker in ticker_list:
        df = get_stock_prices(ticker, start, end)
        if df is None or df.empty:
            raise HTTPException(404, f"No price data found for '{ticker}'. Check the ticker symbol or try a different date range.")
        stock_dfs[ticker] = df

    charizard_df = get_charizard_prices(start, end)

    base_df = list(stock_dfs.values())[0][["date"]].copy()
    merged = base_df.sort_values("date")

    merged = pd.merge_asof(
        merged,
        charizard_df.sort_values("date").rename(columns={"price": "charizard_price"}),
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

    charizard_start = merged.iloc[0]["charizard_price"]
    stock_starts = {t: merged.iloc[0][f"{t}_price"] for t in ticker_list}

    series = []
    charizard_units = amount / charizard_start if charizard_start > 0 else 0
    stock_units = {t: amount / stock_starts[t] if stock_starts[t] > 0 else 0 for t in ticker_list}
    total_invested = amount

    for idx, (_, row) in enumerate(merged.iterrows()):
        if is_dca and idx > 0:
            total_invested += monthly_contrib
            if row["charizard_price"] > 0:
                charizard_units += monthly_contrib / row["charizard_price"]
            for t in ticker_list:
                if row[f"{t}_price"] > 0:
                    stock_units[t] += monthly_contrib / row[f"{t}_price"]

        point = {
            "date": row["date"].strftime("%Y-%m-%d"),
            "charizard": round(charizard_units * row["charizard_price"], 2),
        }
        for t in ticker_list:
            point[t] = round(stock_units[t] * row[f"{t}_price"], 2)
        series.append(point)

    final = series[-1]

    assets = {}
    charizard_values = [p["charizard"] for p in series]
    assets["charizard"] = {
        "label": "Charizard 1st Ed",
        "final_value": final["charizard"],
        "return_pct": round((final["charizard"] - total_invested) / total_invested * 100, 2),
        "metrics": calc_metrics(charizard_values),
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
        col = "charizard" if key == "charizard" else key
        inf_final = inflation_final[col]
        inflation_assets[key] = {
            "final_value": inf_final,
            "return_pct": round((inf_final - total_invested) / total_invested * 100, 2),
        }

    mc_keys = ["charizard"] + ticker_list
    monte_carlo = run_monte_carlo(series, mc_keys)

    return {
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
    }


if DIST_DIR.exists():
    assets_dir = DIST_DIR / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api"):
            return {"error": "Not found"}
        file = DIST_DIR / full_path
        if file.exists() and file.is_file():
            return FileResponse(file)
        index = DIST_DIR / "index.html"
        if index.exists():
            return FileResponse(index)
        return {"error": "Frontend not built"}

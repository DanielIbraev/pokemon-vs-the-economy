from typing import Optional
import requests
import pandas as pd
import os

API_KEY = os.environ.get("FMP_API_KEY", "demo")
BASE_URL = "https://financialmodelingprep.com/api/v3"


def get_stock_prices(ticker: str, start: str, end: str) -> Optional[pd.DataFrame]:
    try:
        url = f"{BASE_URL}/historical-price-full/{ticker}"
        params = {"from": start, "to": end, "apikey": API_KEY}
        resp = requests.get(url, params=params, timeout=15)
        if resp.status_code != 200:
            return None
        data = resp.json()
        historical = data.get("historical", [])
        if not historical:
            return None

        df = pd.DataFrame(historical)
        df["date"] = pd.to_datetime(df["date"])
        df = df.rename(columns={"close": "price"})
        df = df.sort_values("date")

        df["month"] = df["date"].dt.to_period("M")
        df = df.groupby("month").last().reset_index()
        df["date"] = df["month"].dt.to_timestamp()
        df = df[["date", "price"]]

        return df
    except Exception:
        return None


def get_earliest_date(ticker: str) -> Optional[str]:
    try:
        url = f"{BASE_URL}/historical-price-full/{ticker}"
        params = {"apikey": API_KEY, "from": "1990-01-01", "to": "1995-01-01"}
        resp = requests.get(url, params=params, timeout=15)
        if resp.status_code != 200:
            url2 = f"{BASE_URL}/historical-price-full/{ticker}"
            params2 = {"apikey": API_KEY}
            resp2 = requests.get(url2, params=params2, timeout=15)
            if resp2.status_code != 200:
                return None
            data = resp2.json()
        else:
            data = resp.json()

        historical = data.get("historical", [])
        if not historical:
            return None

        dates = sorted([h["date"] for h in historical])
        return dates[0]
    except Exception:
        return None

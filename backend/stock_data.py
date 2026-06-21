from typing import Optional
import requests
import pandas as pd
import os

API_KEY = os.environ.get("TWELVEDATA_API_KEY", "demo")
BASE_URL = "https://api.twelvedata.com"


def get_stock_prices(ticker: str, start: str, end: str) -> Optional[pd.DataFrame]:
    try:
        resp = requests.get(f"{BASE_URL}/time_series", params={
            "symbol": ticker,
            "interval": "1month",
            "start_date": start,
            "end_date": end,
            "apikey": API_KEY,
            "format": "JSON",
            "outputsize": 5000,
        }, timeout=15)
        if resp.status_code != 200:
            return None
        data = resp.json()
        if data.get("status") == "error" or "values" not in data:
            return None

        values = data["values"]
        df = pd.DataFrame(values)
        df["date"] = pd.to_datetime(df["datetime"])
        df["price"] = df["close"].astype(float)
        df = df[["date", "price"]].sort_values("date").reset_index(drop=True)
        return df
    except Exception:
        return None


def get_earliest_date(ticker: str) -> Optional[str]:
    try:
        resp = requests.get(f"{BASE_URL}/earliest_timestamp", params={
            "symbol": ticker,
            "interval": "1month",
            "apikey": API_KEY,
        }, timeout=15)
        if resp.status_code != 200:
            return None
        data = resp.json()
        if "datetime" not in data:
            return None
        return data["datetime"]
    except Exception:
        return None

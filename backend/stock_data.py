from typing import Optional
import requests
import pandas as pd
import os
import logging

logger = logging.getLogger(__name__)

API_KEY = os.environ.get("TWELVEDATA_API_KEY", "demo")
BASE_URL = "https://api.twelvedata.com"


def get_stock_prices(ticker: str, start: str, end: str) -> Optional[pd.DataFrame]:
    try:
        url = f"{BASE_URL}/time_series"
        params = {
            "symbol": ticker,
            "interval": "1month",
            "start_date": start,
            "end_date": end,
            "apikey": API_KEY,
            "format": "JSON",
            "outputsize": 5000,
        }
        logger.info(f"Fetching {ticker} from {start} to {end}, key={API_KEY[:8]}...")
        resp = requests.get(url, params=params, timeout=15)
        logger.info(f"Response status: {resp.status_code}")

        if resp.status_code != 200:
            logger.error(f"HTTP error: {resp.status_code} {resp.text[:200]}")
            return None

        data = resp.json()

        if data.get("status") == "error" or data.get("code"):
            logger.error(f"API error: {data.get('message', data)}")
            return None

        if "values" not in data:
            logger.error(f"No 'values' key in response: {list(data.keys())}")
            return None

        values = data["values"]
        logger.info(f"Got {len(values)} records for {ticker}")

        df = pd.DataFrame(values)
        df["date"] = pd.to_datetime(df["datetime"])
        df["price"] = df["close"].astype(float)
        df = df[["date", "price"]].sort_values("date").reset_index(drop=True)
        return df
    except Exception as e:
        logger.exception(f"Exception fetching {ticker}: {e}")
        return None

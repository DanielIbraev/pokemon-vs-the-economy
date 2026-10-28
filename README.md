# Pokémon vs the Economy

![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Recharts](https://img.shields.io/badge/Recharts-charts-22B5BF?style=flat-square)

**Would a 1st-edition Charizard have beaten the S&P 500?** This is a full-stack backtester that puts graded Pokémon cards head-to-head with any stock or ETF, using the same metrics an analyst would use on a portfolio.

Pick a card, pick some tickers, pick an amount and a start date. The app replays the investment month by month and shows who won.

## What it measures
| Metric | How |
|---|---|
| Growth of $X | Monthly portfolio value for each asset, from your start date |
| Real returns | Every series adjusted for inflation with CPI |
| Risk-adjusted return | Annualized Sharpe ratio from monthly returns |
| Downside | Max drawdown, volatility, best and worst month |
| What's next | Monte Carlo projection (500 bootstrapped paths, 5th–95th percentile bands) |

**Cards:** Charizard, Venusaur and Blastoise, Base Set 1st Edition, with price history back to 1999.
**Stocks:** any ticker, pulled monthly from Yahoo Finance with a Twelve Data fallback.

## Stack
- **Backend:** FastAPI, pandas, NumPy (`backend/`): data loading, CPI adjustment, metrics, Monte Carlo
- **Frontend:** React + Vite + Recharts (`frontend/`): animated battle intro, charts, shareable results card
- **Deploy:** one Render web service (`render.yaml`) that builds the frontend and serves it from FastAPI

## Run it locally
```bash
# backend
pip install -r requirements.txt
cd backend && uvicorn main:app --reload --port 8000

# frontend (in a second terminal)
cd frontend && npm install && npm run dev   # -> http://localhost:5173
```

Optional: copy `.env.example` to `.env` and set `TWELVEDATA_API_KEY` for the fallback price source.

## API
- `GET /api/pokemon` lists the available cards
- `GET /api/backtest?tickers=SPY,AAPL&amount=1000&...` runs a backtest and returns series, metrics and Monte Carlo bands

> Card prices are approximate historical market values for high-grade copies, for comparison and education. Not investment advice.

---
Built by [Daniel Ibraev](https://danielibraev.com) · Finance + Data Science @ Springfield College

from pydantic import BaseModel
from datetime import date
from typing import Optional


class MarketPriceCreate(BaseModel):
    market: str
    crop: str
    price_per_kg: float
    date: Optional[date] = None


class MarketPriceOut(BaseModel):
    id: int
    market: str
    crop: str
    price_per_kg: float
    date: date

    class Config:
        from_attributes = True


class PriceTrend(BaseModel):
    date: date
    price_per_kg: float
    market: str


class BestMarket(BaseModel):
    crop: str
    market: str
    price_per_kg: float
    date: date


class Alert(BaseModel):
    crop: str
    market: str
    message: str
    price_per_kg: float
    change_pct: float


class MarketSummary(BaseModel):
    crop: str
    avg_price: float
    min_price: float
    max_price: float
    best_market: str
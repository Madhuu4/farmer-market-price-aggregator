from sqlalchemy import Column, Integer, String, Float, Date
from database import Base
from datetime import datetime


class MarketPrice(Base):
    __tablename__ = "market_prices"

    id = Column(Integer, primary_key=True, index=True)
    market = Column(String, index=True)
    crop = Column(String, index=True)
    price_per_kg = Column(Float)
    date = Column(Date, default=datetime.utcnow().date)
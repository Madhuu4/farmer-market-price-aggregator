from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta
import models, schemas, crud
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Farmer's Market Price Aggregator", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Seed demo data on startup ──────────────────────────────────────────────────
@app.on_event("startup")
def seed_data():
    db = next(get_db())
    if db.query(models.MarketPrice).count() == 0:
        demo = [
            ("Bangalore", "Tomato", 28), ("Mysore", "Tomato", 32),
            ("Mandya", "Tomato", 30), ("Hassan", "Tomato", 27),
            ("Bangalore", "Potato", 22), ("Mysore", "Potato", 20),
            ("Mandya", "Potato", 25), ("Hassan", "Potato", 21),
            ("Bangalore", "Onion", 35), ("Mysore", "Onion", 38),
            ("Mandya", "Onion", 33), ("Hassan", "Onion", 36),
            ("Bangalore", "Carrot", 45), ("Mysore", "Carrot", 42),
            ("Bangalore", "Cabbage", 18), ("Mysore", "Cabbage", 20),
            ("Bangalore", "Brinjal", 30), ("Mysore", "Brinjal", 28),
            ("Bangalore", "Capsicum", 60), ("Mysore", "Capsicum", 55),
        ]
        today = datetime.utcnow().date()
        for market, crop, price in demo:
            for i in range(7):
                import random
                variation = random.randint(-4, 4)
                day = today - timedelta(days=6 - i)
                entry = models.MarketPrice(
                    market=market, crop=crop,
                    price_per_kg=max(5, price + variation + i),
                    date=day
                )
                db.add(entry)
        db.commit()
    db.close()


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "Farmer's Market Price Aggregator API"}


@app.post("/prices/", response_model=schemas.MarketPriceOut)
def create_price(price: schemas.MarketPriceCreate, db: Session = Depends(get_db)):
    return crud.create_price(db, price)


@app.get("/prices/", response_model=list[schemas.MarketPriceOut])
def get_prices(
    crop: Optional[str] = Query(None),
    market: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return crud.get_prices(db, crop=crop, market=market)


@app.get("/prices/search/", response_model=list[schemas.MarketPriceOut])
def search_prices(crop: str = Query(...), db: Session = Depends(get_db)):
    results = crud.search_by_crop(db, crop)
    if not results:
        raise HTTPException(status_code=404, detail=f"No prices found for '{crop}'")
    return results


@app.get("/prices/trends/", response_model=list[schemas.PriceTrend])
def get_trends(
    crop: str = Query(...),
    market: Optional[str] = Query(None),
    days: int = Query(7),
    db: Session = Depends(get_db)
):
    return crud.get_trends(db, crop=crop, market=market, days=days)


@app.get("/prices/best/", response_model=schemas.BestMarket)
def get_best_market(crop: str = Query(...), db: Session = Depends(get_db)):
    result = crud.get_best_market(db, crop)
    if not result:
        raise HTTPException(status_code=404, detail=f"No data for '{crop}'")
    return result


@app.get("/crops/", response_model=list[str])
def get_crops(db: Session = Depends(get_db)):
    return crud.get_distinct_crops(db)


@app.get("/markets/", response_model=list[str])
def get_markets(db: Session = Depends(get_db)):
    return crud.get_distinct_markets(db)


@app.get("/alerts/", response_model=list[schemas.Alert])
def get_alerts(crop: Optional[str] = Query(None), db: Session = Depends(get_db)):
    return crud.get_alerts(db, crop=crop)


@app.get("/summary/", response_model=list[schemas.MarketSummary])
def get_summary(db: Session = Depends(get_db)):
    return crud.get_summary(db)


@app.delete("/prices/{price_id}")
def delete_price(price_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_price(db, price_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Price entry not found")
    return {"message": "Deleted successfully"}
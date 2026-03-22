from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
import models, schemas
from typing import Optional


def create_price(db: Session, price: schemas.MarketPriceCreate):
    date = price.date or datetime.utcnow().date()
    entry = models.MarketPrice(
        market=price.market.strip().title(),
        crop=price.crop.strip().title(),
        price_per_kg=price.price_per_kg,
        date=date
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def get_prices(db: Session, crop: Optional[str] = None, market: Optional[str] = None):
    q = db.query(models.MarketPrice)
    if crop:
        q = q.filter(models.MarketPrice.crop.ilike(f"%{crop}%"))
    if market:
        q = q.filter(models.MarketPrice.market.ilike(f"%{market}%"))
    return q.order_by(desc(models.MarketPrice.date)).limit(100).all()


def search_by_crop(db: Session, crop: str):
    """Return the latest price per market for the given crop."""
    subq = (
        db.query(
            models.MarketPrice.market,
            func.max(models.MarketPrice.date).label("max_date")
        )
        .filter(models.MarketPrice.crop.ilike(f"%{crop}%"))
        .group_by(models.MarketPrice.market)
        .subquery()
    )
    return (
        db.query(models.MarketPrice)
        .join(subq, (models.MarketPrice.market == subq.c.market) &
              (models.MarketPrice.date == subq.c.max_date))
        .filter(models.MarketPrice.crop.ilike(f"%{crop}%"))
        .order_by(desc(models.MarketPrice.price_per_kg))
        .all()
    )


def get_trends(db: Session, crop: str, market: Optional[str] = None, days: int = 7):
    since = datetime.utcnow().date() - timedelta(days=days)
    q = (
        db.query(models.MarketPrice)
        .filter(
            models.MarketPrice.crop.ilike(f"%{crop}%"),
            models.MarketPrice.date >= since
        )
    )
    if market:
        q = q.filter(models.MarketPrice.market.ilike(f"%{market}%"))
    return q.order_by(models.MarketPrice.date).all()


def get_best_market(db: Session, crop: str):
    """Return the market with the highest latest price for a crop."""
    subq = (
        db.query(func.max(models.MarketPrice.date).label("max_date"))
        .filter(models.MarketPrice.crop.ilike(f"%{crop}%"))
        .scalar_subquery()
    )
    return (
        db.query(models.MarketPrice)
        .filter(
            models.MarketPrice.crop.ilike(f"%{crop}%"),
            models.MarketPrice.date == subq
        )
        .order_by(desc(models.MarketPrice.price_per_kg))
        .first()
    )


def get_distinct_crops(db: Session):
    rows = db.query(models.MarketPrice.crop).distinct().all()
    return sorted([r[0] for r in rows])


def get_distinct_markets(db: Session):
    rows = db.query(models.MarketPrice.market).distinct().all()
    return sorted([r[0] for r in rows])


def get_alerts(db: Session, crop: Optional[str] = None):
    """Detect crops where price jumped >10% in the last 2 days."""
    alerts = []
    crops = [crop] if crop else get_distinct_crops(db)
    for c in crops:
        markets = get_distinct_markets(db)
        for m in markets:
            rows = (
                db.query(models.MarketPrice)
                .filter(
                    models.MarketPrice.crop.ilike(f"%{c}%"),
                    models.MarketPrice.market.ilike(f"%{m}%")
                )
                .order_by(desc(models.MarketPrice.date))
                .limit(2)
                .all()
            )
            if len(rows) == 2:
                new_p, old_p = rows[0].price_per_kg, rows[1].price_per_kg
                if old_p > 0:
                    change = ((new_p - old_p) / old_p) * 100
                    if change >= 10:
                        alerts.append(schemas.Alert(
                            crop=rows[0].crop,
                            market=rows[0].market,
                            message=f"Price surged by {change:.1f}% in {m}!",
                            price_per_kg=new_p,
                            change_pct=round(change, 1)
                        ))
                    elif change <= -10:
                        alerts.append(schemas.Alert(
                            crop=rows[0].crop,
                            market=rows[0].market,
                            message=f"Price dropped by {abs(change):.1f}% in {m}.",
                            price_per_kg=new_p,
                            change_pct=round(change, 1)
                        ))
    return alerts


def get_summary(db: Session):
    crops = get_distinct_crops(db)
    summaries = []
    for crop in crops:
        latest_prices = search_by_crop(db, crop)
        if not latest_prices:
            continue
        prices = [p.price_per_kg for p in latest_prices]
        best = max(latest_prices, key=lambda p: p.price_per_kg)
        summaries.append(schemas.MarketSummary(
            crop=crop,
            avg_price=round(sum(prices) / len(prices), 2),
            min_price=min(prices),
            max_price=max(prices),
            best_market=best.market
        ))
    return summaries


def delete_price(db: Session, price_id: int):
    entry = db.query(models.MarketPrice).filter(models.MarketPrice.id == price_id).first()
    if not entry:
        return None
    db.delete(entry)
    db.commit()
    return True
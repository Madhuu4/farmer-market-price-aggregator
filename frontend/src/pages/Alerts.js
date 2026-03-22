import React, { useState, useEffect } from "react";
import { fetchAlerts, fetchCrops } from "../api";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [crops, setCrops] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const load = (crop) => {
    setLoading(true);
    fetchAlerts(crop || undefined).then(setAlerts).finally(() => setLoading(false));
  };

  useEffect(() => { fetchCrops().then(setCrops); load(); }, []);

  const up = alerts.filter(a => a.change_pct > 0);
  const down = alerts.filter(a => a.change_pct < 0);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Price Alerts</div>
        <div className="page-sub">Markets with significant price movements (≥10%)</div>
      </div>

      {/* Controls */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Filter by Crop</label>
            <select value={filter} onChange={e => { setFilter(e.target.value); load(e.target.value); }}>
              <option value="">All Crops</option>
              {crops.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <button className="btn btn-secondary" onClick={() => load(filter)}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <div className="card" style={{ borderLeft: "4px solid var(--amber)" }}>
          <div className="card-label">Price Surges</div>
          <div className="card-value amber">{up.length}</div>
          <div className="card-meta">Up ≥10%</div>
        </div>
        <div className="card" style={{ borderLeft: "4px solid var(--green-light)" }}>
          <div className="card-label">Price Drops</div>
          <div className="card-value" style={{ color: "var(--green-mid)" }}>{down.length}</div>
          <div className="card-meta">Down ≥10%</div>
        </div>
        <div className="card">
          <div className="card-label">Total Alerts</div>
          <div className="card-value">{alerts.length}</div>
          <div className="card-meta">Across all markets</div>
        </div>
      </div>

      {loading && <div className="loading">Scanning for price changes…</div>}

      {!loading && alerts.length === 0 && (
        <div className="empty">
          <div className="empty-icon">✅</div>
          <div className="empty-text">No significant price movements detected right now.</div>
        </div>
      )}

      {!loading && up.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <TrendingUp color="var(--amber-dark)" />
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700 }}>
              Price Surges
            </span>
          </div>
          {up.map((a, i) => (
            <div key={i} className="alert-card alert-up">
              <div className="alert-icon">📈</div>
              <div style={{ flex: 1 }}>
                <div className="alert-title">{a.crop} — {a.market}</div>
                <div className="alert-body">{a.message}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 18 }}>
                  ₹{a.price_per_kg}
                </div>
                <span className="badge badge-amber">+{a.change_pct}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && down.length > 0 && (
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <TrendingDown color="var(--green-mid)" />
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700 }}>
              Price Drops
            </span>
          </div>
          {down.map((a, i) => (
            <div key={i} className="alert-card alert-down">
              <div className="alert-icon">📉</div>
              <div style={{ flex: 1 }}>
                <div className="alert-title">{a.crop} — {a.market}</div>
                <div className="alert-body">{a.message}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 18 }}>
                  ₹{a.price_per_kg}
                </div>
                <span className="badge badge-green">{a.change_pct}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
import React, { useEffect, useState } from "react";
import { fetchSummary, fetchAlerts } from "../api";
import { TrendingUp, TrendingDown, Search, PlusCircle } from "lucide-react";

export default function Dashboard({ onNavigate }) {
  const [summary, setSummary] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchSummary(), fetchAlerts()])
      .then(([s, a]) => { setSummary(s); setAlerts(a); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading market data…</div>;

  const totalCrops = summary.length;
  const avgAll = summary.length
    ? (summary.reduce((s, r) => s + r.avg_price, 0) / summary.length).toFixed(2)
    : 0;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Market Overview</div>
        <div className="page-sub">Latest prices across Karnataka markets</div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="card">
          <div className="card-label">Crops Tracked</div>
          <div className="card-value">{totalCrops}</div>
          <div className="card-meta">Across all markets</div>
        </div>
        <div className="card">
          <div className="card-label">Avg Price / kg</div>
          <div className="card-value">₹{avgAll}</div>
          <div className="card-meta">Today</div>
        </div>
        <div className="card">
          <div className="card-label">Active Alerts</div>
          <div className="card-value amber">{alerts.length}</div>
          <div className="card-meta">Price movements</div>
        </div>
        <div className="card">
          <div className="card-label">Markets Active</div>
          <div className="card-value">4</div>
          <div className="card-meta">Bangalore, Mysore, Mandya, Hassan</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="two-col" style={{ marginBottom: 24 }}>
        <button className="btn btn-primary" style={{ padding: "14px 20px", borderRadius: 12 }}
          onClick={() => onNavigate("search")}>
          <Search size={18} /> Search Crop Prices
        </button>
        <button className="btn btn-secondary" style={{ padding: "14px 20px", borderRadius: 12 }}
          onClick={() => onNavigate("submit")}>
          <PlusCircle size={18} /> Add New Price
        </button>
      </div>

      {/* Summary Table */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
          Crop Price Summary
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Crop</th>
                <th>Avg Price</th>
                <th>Min</th>
                <th>Max</th>
                <th>Best Market</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((row) => (
                <tr key={row.crop}>
                  <td><strong>{row.crop}</strong></td>
                  <td>₹{row.avg_price}</td>
                  <td>₹{row.min_price}</td>
                  <td style={{ color: "var(--green-mid)", fontWeight: 600 }}>₹{row.max_price}</td>
                  <td><span className="badge badge-green">{row.best_market}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <div className="card">
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
            Recent Alerts
          </div>
          {alerts.slice(0, 3).map((a, i) => (
            <div key={i} className={`alert-card ${a.change_pct > 0 ? "alert-up" : "alert-down"}`}>
              <div className="alert-icon">
                {a.change_pct > 0 ? <TrendingUp size={22} color="#f4a261" /> : <TrendingDown size={22} color="#52b788" />}
              </div>
              <div>
                <div className="alert-title">{a.crop} — {a.market}</div>
                <div className="alert-body">{a.message} Current: ₹{a.price_per_kg}/kg</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
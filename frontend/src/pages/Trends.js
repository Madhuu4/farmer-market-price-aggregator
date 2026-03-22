import React, { useState, useEffect } from "react";
import { fetchTrends, fetchCrops, fetchMarkets } from "../api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";

const COLORS = ["#2d6a4f", "#f4a261", "#52b788", "#e76f51", "#b7e4c7"];

export default function Trends() {
  const [crop, setCrop] = useState("");
  const [market, setMarket] = useState("");
  const [days, setDays] = useState(7);
  const [crops, setCrops] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([fetchCrops(), fetchMarkets()]).then(([c, m]) => {
      setCrops(c); setMarkets(m);
      if (c.length) { setCrop(c[0]); }
    });
  }, []);

  useEffect(() => {
    if (!crop) return;
    setLoading(true);
    fetchTrends(crop, market || undefined, days)
      .then(rows => {
        // Group by date → pivot by market
        const byDate = {};
        rows.forEach(r => {
          if (!byDate[r.date]) byDate[r.date] = { date: r.date };
          byDate[r.date][r.market] = r.price_per_kg;
        });
        setData(Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date)));
      })
      .finally(() => setLoading(false));
  }, [crop, market, days]);

  const allMarkets = [...new Set(data.flatMap(d => Object.keys(d).filter(k => k !== "date")))];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Price Trends</div>
        <div className="page-sub">Track how prices change over time</div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 140 }}>
            <label>Crop</label>
            <select value={crop} onChange={e => setCrop(e.target.value)}>
              {crops.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 140 }}>
            <label>Market (optional)</label>
            <select value={market} onChange={e => setMarket(e.target.value)}>
              <option value="">All Markets</option>
              {markets.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 120 }}>
            <label>Period</label>
            <select value={days} onChange={e => setDays(Number(e.target.value))}>
              <option value={7}>Last 7 Days</option>
              <option value={14}>Last 14 Days</option>
              <option value={30}>Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card">
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
          {crop} Price Trend {market ? `— ${market}` : ""}
        </div>
        {loading ? (
          <div className="loading">Loading chart…</div>
        ) : data.length === 0 ? (
          <div className="empty"><div className="empty-icon">📊</div><div className="empty-text">No trend data available</div></div>
        ) : (
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe0" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#7a7a7a" }} />
              <YAxis
                tick={{ fontSize: 12, fill: "#7a7a7a" }}
                tickFormatter={v => `₹${v}`}
              />
              <Tooltip formatter={(v) => [`₹${v}/kg`]} />
              <Legend />
              {allMarkets.map((m, i) => (
                <Line
                  key={m}
                  type="monotone"
                  dataKey={m}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Data Table */}
      {data.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>Price History Table</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  {allMarkets.map(m => <th key={m}>{m}</th>)}
                </tr>
              </thead>
              <tbody>
                {data.map(row => (
                  <tr key={row.date}>
                    <td>{row.date}</td>
                    {allMarkets.map(m => (
                      <td key={m}>{row[m] != null ? `₹${row[m]}` : "—"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
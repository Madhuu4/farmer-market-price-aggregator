import React, { useState, useEffect } from "react";
import { submitPrice, fetchCrops, fetchMarkets } from "../api";
import toast from "react-hot-toast";
import { CheckCircle } from "lucide-react";

export default function Submit({ onSuccess }) {
  const [form, setForm] = useState({ market: "", crop: "", price_per_kg: "", date: "" });
  const [crops, setCrops] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customCrop, setCustomCrop] = useState(false);
  const [customMarket, setCustomMarket] = useState(false);

  useEffect(() => {
    Promise.all([fetchCrops(), fetchMarkets()]).then(([c, m]) => { setCrops(c); setMarkets(m); });
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.market || !form.crop || !form.price_per_kg) {
      toast.error("Please fill Market, Crop and Price.");
      return;
    }
    if (parseFloat(form.price_per_kg) <= 0) {
      toast.error("Price must be a positive number.");
      return;
    }
    setLoading(true);
    try {
      await submitPrice({
        market: form.market,
        crop: form.crop,
        price_per_kg: parseFloat(form.price_per_kg),
        date: form.date || undefined,
      });
      toast.success("Price submitted successfully!");
      setForm({ market: "", crop: "", price_per_kg: "", date: "" });
    } catch {
      toast.error("Failed to submit price.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Add Market Price</div>
        <div className="page-sub">Submit today's crop price from your local market</div>
      </div>

      <div className="two-col">
        <div className="card">
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
            Price Entry Form
          </div>

          {/* Market */}
          <div className="form-group">
            <label>Market</label>
            {!customMarket ? (
              <div style={{ display: "flex", gap: 8 }}>
                <select value={form.market} onChange={e => set("market", e.target.value)} style={{ flex: 1 }}>
                  <option value="">Select market…</option>
                  {markets.map(m => <option key={m}>{m}</option>)}
                </select>
                <button className="btn btn-secondary" style={{ padding: "10px 14px" }} onClick={() => setCustomMarket(true)}>+ New</button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <input placeholder="Enter market name" value={form.market} onChange={e => set("market", e.target.value)} />
                <button className="btn btn-secondary" style={{ padding: "10px 14px" }} onClick={() => setCustomMarket(false)}>List</button>
              </div>
            )}
          </div>

          {/* Crop */}
          <div className="form-group">
            <label>Crop</label>
            {!customCrop ? (
              <div style={{ display: "flex", gap: 8 }}>
                <select value={form.crop} onChange={e => set("crop", e.target.value)} style={{ flex: 1 }}>
                  <option value="">Select crop…</option>
                  {crops.map(c => <option key={c}>{c}</option>)}
                </select>
                <button className="btn btn-secondary" style={{ padding: "10px 14px" }} onClick={() => setCustomCrop(true)}>+ New</button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <input placeholder="Enter crop name" value={form.crop} onChange={e => set("crop", e.target.value)} />
                <button className="btn btn-secondary" style={{ padding: "10px 14px" }} onClick={() => setCustomCrop(false)}>List</button>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="form-group">
            <label>Price per kg (₹)</label>
            <input
              type="number" min="1" step="0.5"
              placeholder="e.g. 28"
              value={form.price_per_kg}
              onChange={e => set("price_per_kg", e.target.value)}
            />
          </div>

          {/* Date */}
          <div className="form-group">
            <label>Date (optional — defaults to today)</label>
            <input type="date" value={form.date} onChange={e => set("date", e.target.value)} />
          </div>

          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
            {loading ? "Submitting…" : <><CheckCircle size={16} /> Submit Price</>}
          </button>
        </div>

        {/* Info panel */}
        <div>
          <div className="card" style={{ background: "var(--cream-dark)", border: "1.5px solid var(--green-pale)" }}>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>📋 Guidelines</div>
            <ul style={{ paddingLeft: 18, lineHeight: 2, fontSize: 14, color: "var(--text-mid)" }}>
              <li>Enter the current wholesale price per kg</li>
              <li>Select the correct local market name</li>
              <li>Prices are updated daily</li>
              <li>Data helps farmers get fair prices</li>
              <li>New crops/markets can be added freely</li>
            </ul>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>🌾 Common Crops</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["Tomato", "Potato", "Onion", "Carrot", "Cabbage", "Brinjal", "Capsicum", "Beans"].map(c => (
                <span key={c}
                  className="badge badge-green"
                  style={{ cursor: "pointer" }}
                  onClick={() => set("crop", c)}
                >{c}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
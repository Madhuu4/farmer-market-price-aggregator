import React, { useState, useEffect } from "react";
import { searchCrop, fetchBestMarket, fetchCrops } from "../api";
import { Search, Star } from "lucide-react";
import toast from "react-hot-toast";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [best, setBest] = useState(null);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => { fetchCrops().then(setCrops); }, []);

  const handleSearch = async (cropName) => {
    const q = cropName || query;
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const [res, bestRes] = await Promise.all([
        searchCrop(q),
        fetchBestMarket(q).catch(() => null),
      ]);
      setResults(res);
      setBest(bestRes);
    } catch {
      toast.error("No prices found for that crop.");
      setResults([]);
      setBest(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Search Crop Prices</div>
        <div className="page-sub">Find the best market to sell your crop today</div>
      </div>

      {/* Search bar */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <input
            placeholder="e.g. Tomato, Onion, Potato…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            style={{ flex: 1 }}
          />
          <button className="btn btn-primary" onClick={() => handleSearch()}>
            <Search size={16} /> Search
          </button>
        </div>

        {/* Quick crops */}
        <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {crops.map(c => (
            <button key={c} className="badge badge-green"
              style={{ cursor: "pointer", border: "none", padding: "6px 14px", fontSize: 13 }}
              onClick={() => { setQuery(c); handleSearch(c); }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Best Market Banner */}
      {best && (
        <div className="card" style={{
          background: "linear-gradient(135deg, var(--green-dark), var(--green-mid))",
          color: "white", marginBottom: 20
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Star size={24} fill="#f4a261" color="#f4a261" />
            <div>
              <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 2 }}>Best Market for {best.crop}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700 }}>
                {best.market} — ₹{best.price_per_kg}/kg
              </div>
              <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>Last updated: {best.date}</div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {loading && <div className="loading">Searching markets…</div>}

      {!loading && searched && results.length === 0 && (
        <div className="empty">
          <div className="empty-icon">🔍</div>
          <div className="empty-text">No prices found. Try a different crop name.</div>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="card">
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
            Prices across markets
          </div>
          {results.map((r, i) => (
            <div key={r.id} className={`price-card ${i === 0 ? "best" : ""}`}>
              <div>
                <div className="market-name">{r.market}</div>
                <div style={{ fontSize: 12, color: "var(--text-light)" }}>{r.date}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="price-val">₹{r.price_per_kg}/kg</div>
                {i === 0 && <span className="badge badge-green" style={{ fontSize: 11 }}>Best Price</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {!searched && (
        <div className="empty">
          <div className="empty-icon">🌽</div>
          <div className="empty-text">Search for a crop to see prices across all markets</div>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Dashboard from "./pages/Dashboard";
import Search from "./pages/Search";
import Trends from "./pages/Trends";
import Submit from "./pages/Submit";
import Alerts from "./pages/Alerts";
import { LayoutDashboard, Search as SearchIcon, TrendingUp, PlusCircle, Bell } from "lucide-react";
import "./index.css";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "search", label: "Search", icon: SearchIcon },
  { id: "trends", label: "Trends", icon: TrendingUp },
  { id: "submit", label: "Add Price", icon: PlusCircle },
  { id: "alerts", label: "Alerts", icon: Bell },
];

export default function App() {
  const [page, setPage] = useState("dashboard");

  return (
    <div className="app-shell">
      <Toaster position="top-right" />

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">🌾</span>
          <div>
            <div className="brand-title">KisanMandi</div>
            <div className="brand-sub">Market Price Hub</div>
          </div>
        </div>
        <nav className="nav-list">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${page === id ? "active" : ""}`}
              onClick={() => setPage(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span>Karnataka, India</span>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        {page === "dashboard" && <Dashboard onNavigate={setPage} />}
        {page === "search" && <Search />}
        {page === "trends" && <Trends />}
        {page === "submit" && <Submit onSuccess={() => setPage("dashboard")} />}
        {page === "alerts" && <Alerts />}
      </main>
    </div>
  );
}
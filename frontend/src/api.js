import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:8000" });

export const fetchCrops = () => API.get("/crops/").then(r => r.data);
export const fetchMarkets = () => API.get("/markets/").then(r => r.data);
export const fetchSummary = () => API.get("/summary/").then(r => r.data);
export const fetchAlerts = (crop) => API.get("/alerts/", { params: crop ? { crop } : {} }).then(r => r.data);
export const searchCrop = (crop) => API.get("/prices/search/", { params: { crop } }).then(r => r.data);
export const fetchTrends = (crop, market, days = 7) =>
  API.get("/prices/trends/", { params: { crop, market, days } }).then(r => r.data);
export const fetchBestMarket = (crop) => API.get("/prices/best/", { params: { crop } }).then(r => r.data);
export const submitPrice = (data) => API.post("/prices/", data).then(r => r.data);
export const deletePrice = (id) => API.delete(`/prices/${id}`).then(r => r.data);
export const fetchPrices = (crop, market) =>
  API.get("/prices/", { params: { crop, market } }).then(r => r.data);
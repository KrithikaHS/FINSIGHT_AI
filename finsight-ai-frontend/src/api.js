// src/api.js
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000/api/accounts";

const client = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

// Attach JWT token if available
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---------------------- AUTH ----------------------

/**
 * Sign up a new user
 * @param {Object} formData - { name, email, password }
 */
export async function signup({ name, email, password }) {
  const res = await client.post("/signup/", {
    first_name: name,
    email,
    password,
  });
  
  return res.data;
}

/**
 * Log in a user and get JWT tokens
 * @param {string} email
 * @param {string} password
 */
export async function login(email, password) {
  const res = await client.post("/login/", {
    username : email,
    password,
  });
  return res.data; // Expected { access, refresh, user }
}

// ---------------------- EXPENSES ----------------------

export async function fetchExpenses(params = {}) {
  const res = await client.get("/expenses/", { params });
  return res.data;
}

export async function createExpense(payload) {
  const res = await client.post("/expenses/", payload);
  return res.data;
}

export async function updateExpense(id, payload) {
  const res = await client.put(`/expenses/${id}/`, payload);
  return res.data;
}

export async function deleteExpense(id) {
  const res = await client.delete(`/expenses/${id}/`);
  return res.data;
}

export async function uploadReceipt(formData) {
  const res = await client.post("/expenses/receipt-upload/", formData, 
    // headers: { "Content-Type": "multipart/form-data" },
  );
  console.log(res.data)
  return res.data;
}

// ---------------------- ANALYTICS ----------------------

export async function getForecast(params = {}) {
  const res = await client.get("/analytics/forecast/", { params });
  return res.data;
}

export async function getTrends(params = {}) {
  const res = await client.get("/analytics/trends/", { params });
  return res.data;
}

// ---------------------- RECOMMENDATIONS & ALERTS ----------------------

export async function getRecommendations(userId) {
  const res = await client.get(`/recommendations/`, { params: { user: userId } });
  return res.data;
}

export async function getAlerts() {
  const res = await client.get("/alerts/");
  return res.data;
}

export async function fetchHeatmapData() {
  const token = localStorage.getItem("token");
  const res = await client.get("/heatmap/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  // Axios puts the response data in res.data
  console.log(res.data);
  return res.data;  // directly return the data, no need to parse json
}

// src/api.js

export async function fetchRecurringExpenses() {
  const res = await client.get("/recurring-expenses/");
  return res.data;
}


export async function fetchRecurringExpenseById(id) {
  console.log("caldded")
  const res = await client.get(`/recurring-expenses/${id}/`);
  console.log(res.data)
  return res.data;
}

export async function createRecurringExpense(data) {
  const res = await client.post("/recurring-expenses/", data);
  console.log(res.data)
  return res.data;
}

export async function updateRecurringExpense(id, data) {
  const res = await client.put(`/recurring-expenses/${id}/`, data);
  return res.data;
}

export async function deleteRecurringExpense(id) {
  const res = await client.delete(`/recurring-expenses/${id}/`);
  return res.data;
}

// src/api.js

export async function getCategoryAnalytics() {
  const res = await client.get("/analytics/category/");
  return res.data; // axios already gives the parsed JSON here
}

export async function getTopExpenses() {
  const res = await client.get("/top-expenses/");
  return res.data;
}

export async function getSpendTrends(period = "daily") {
  const res = await client.get("/trends/", { params: { period } });
  return res.data;
}


export default client;

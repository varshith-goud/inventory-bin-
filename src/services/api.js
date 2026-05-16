import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8081/api",
});

// Attach token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If token expires or is invalid, redirect to login
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    // Don't redirect on auth endpoints — let the component handle the error
    if (!url.includes("/auth/") && (error.response?.status === 401 || error.response?.status === 403)) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth
export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);

// Categories
export const getCategories = () => API.get("/categories");
export const createCategory = (data) => API.post("/categories", data);
export const deleteCategory = (id) => API.delete(`/categories/${id}`);

// Suppliers
export const getSuppliers = () => API.get("/suppliers");
export const createSupplier = (data) => API.post("/suppliers", data);
export const deleteSupplier = (id) => API.delete(`/suppliers/${id}`);

// Items
export const getItems = () => API.get("/items");
export const getItemsByCategory = (id) => API.get(`/items/category/${id}`);
export const createItem = (data) => API.post("/items", data);
export const updateItem = (id, data) => API.put(`/items/${id}`, data);
export const deleteItem = (id) => API.delete(`/items/${id}`);

// Stock Levels
export const getStock = () => API.get("/stock");
export const getStockPaginated = (page, size, search = "", categoryId = "") => {
  let url = `/stock/page?page=${page}&size=${size}&search=${encodeURIComponent(search)}`;
  if (categoryId) url += `&categoryId=${categoryId}`;
  return API.get(url);
};
export const getStockBelowMin = () => API.get("/stock/below-minimum");
export const createStock = (data) => API.post("/stock", data);
export const updateStockQty = (id, qty) => API.put(`/stock/${id}/qty?qty=${qty}`);

// Reorders
export const getReorders = () => API.get("/reorders");
export const getReordersByStatus = (status) => API.get(`/reorders/status/${status}`);
export const suggestReorders = () => API.post("/reorders/suggest");
export const updateReorderStatus = (id, status) =>
  API.put(`/reorders/${id}/status?status=${status}`);
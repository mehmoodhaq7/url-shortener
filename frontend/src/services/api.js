import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Something went wrong";
    return Promise.reject(new Error(message));
  },
);

export const urlService = {
  shorten: (originalUrl, customSlug) =>
    api.post("/api/urls", { originalUrl, customSlug }),

  getAll: (page = 1, limit = 10) =>
    api.get("/api/urls", { params: { page, limit } }),

  getStats: (id) => api.get(`/api/urls/${id}`),

  delete: (id) => api.delete(`/api/urls/${id}`),
};

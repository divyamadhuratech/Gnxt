import { createRoot } from "react-dom/client";
import App from "./app/App";
import "./styles/index.css";
import axios from "axios";

// Patch window.fetch globally to automatically include local storage gnxt_token on all API requests
const originalFetch = window.fetch;
window.fetch = async (url, options = {}) => {
  const token = localStorage.getItem("gnxt_token");
  if (token && (url.toString().includes("/api/") || url.toString().includes("localhost:5000"))) {
    if (!options.headers) {
      options.headers = {};
    }
    if (options.headers instanceof Headers) {
      if (!options.headers.has("Authorization")) {
        options.headers.set("Authorization", `Bearer ${token}`);
      }
    } else {
      if (!options.headers.Authorization && !options.headers.authorization) {
        options.headers.Authorization = `Bearer ${token}`;
      }
    }
  }
  return originalFetch(url, options);
};

// Patch axios globally to automatically include local storage gnxt_token on all API requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("gnxt_token");
    if (token && (config.url?.includes("/api/") || config.url?.includes("localhost:5000"))) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

createRoot(document.getElementById("root")).render(<App />);

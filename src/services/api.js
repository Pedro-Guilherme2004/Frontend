// src/services/api.js


import axios from "axios";

const api = axios.create({
  baseURL: "https://geticard.onrender.com",
});

// Adiciona automaticamente o JWT nas requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers["Authorization"] = "Bearer " + token;
  }
  return config;
});

export default api;



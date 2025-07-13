// src/services/api.js

import axios from "axios";

const api = axios.create({
  baseURL: "https://frontend-pi-neon-75.vercel.app/", // use o endereço do seu backend Render
});

export default api;


// src/services/api.js

import axios from "axios";

const api = axios.create({
  baseURL: "https://geticard.onrender.com", // use o endereço do seu backend Render
});

export default api;


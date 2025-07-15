// src/services/api.js

import axios from "axios";

const api = axios.create({
  baseURL: "https://geticard.onrender.com/api", // sem barra no final!
});

export default api;


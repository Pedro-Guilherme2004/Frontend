// src/services/api.js

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // ajuste se o seu back rodar em outra porta ou prefixo
});

export default api;

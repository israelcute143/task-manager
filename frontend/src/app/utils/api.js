import axios from "axios";

// Create axios instance
const API = axios.create({
  baseURL: "http://localhost:5000/api", // 👈 change if backend runs on different port or deployed
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;

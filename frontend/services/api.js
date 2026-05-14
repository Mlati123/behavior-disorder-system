import axios from "axios";

const API = axios.create({
  baseURL: "https://behavior-disorder-system-production.up.railway.app",
});

export default API;
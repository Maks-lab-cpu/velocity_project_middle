import axios from "axios";
import { getAccessToken, getRefreshToken, removeTokens, setTokens } from "./tokenService";

const API_URL = "http://127.0.0.1:8000/api/";
const protectedUrls = [
  'cart/',
  'orders/',
  'profile/',
  'favorites/',
];

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  const url = config.url || '';
  const isProtected = protectedUrls.some(p => url.startsWith(p));
  console.log(`🌐 Request: ${config.method.toUpperCase()} ${url}`);
  console.log(`   🔑 Token present: ${!!token}`);
  console.log(`   🛡️ Is protected: ${isProtected}`);

  if (token && isProtected) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log(`   ✅ Token added to ${url}`);
  } else {
    console.log(`   ⚠️ No token added (token: ${!!token}, protected: ${isProtected})`);
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}token/refresh/`, {
            refresh: refreshToken,
          });
          setTokens(data.access, refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return api(originalRequest);
        } catch (refreshError) {
          removeTokens();
          window.location.href = "/login";
        }
      } else {
        removeTokens();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
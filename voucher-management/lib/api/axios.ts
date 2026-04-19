import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (err: unknown) => void }[] = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => {
    if (token) p.resolve(token);
    else p.reject(error);
  });
  failedQueue = [];
}

function getAuthStorage() {
  try {
    const raw = localStorage.getItem("auth-storage");
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

function updateAuthStorage(accessToken: string, refreshToken: string, expiresIn: number) {
  try {
    const raw = localStorage.getItem("auth-storage");
    if (raw) {
      const parsed = JSON.parse(raw);
      parsed.state.token = accessToken;
      parsed.state.refreshToken = refreshToken;
      parsed.state.expiry = Date.now() + expiresIn * 1000;
      localStorage.setItem("auth-storage", JSON.stringify(parsed));
      document.cookie = `auth_token=${accessToken}; path=/; max-age=${expiresIn}`;
    }
  } catch { /* ignore */ }
}

function forceLogout() {
  localStorage.removeItem("auth-storage");
  document.cookie = "auth_token=; path=/; max-age=0";
  window.location.href = "/login";
}

// Request interceptor: gắn token
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const storage = getAuthStorage();
    const token = storage?.state?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor: auto refresh token khi 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Chỉ xử lý 401 và chưa retry
    if (error.response?.status !== 401 || originalRequest._retry || typeof window === "undefined") {
      return Promise.reject(error);
    }

    // Không refresh cho chính request refresh token (tránh loop)
    if (originalRequest.url?.includes("/api/auth/refresh") || originalRequest.url?.includes("/api/auth/token")) {
      forceLogout();
      return Promise.reject(error);
    }

    // Nếu đang refresh, queue request lại
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            originalRequest._retry = true;
            resolve(axiosInstance(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const storage = getAuthStorage();
      const refreshToken = storage?.state?.refreshToken;

      if (!refreshToken) {
        forceLogout();
        return Promise.reject(error);
      }

      const res = await axios.post("/api/auth/refresh", { refreshToken });
      const tokenData = res.data?.data || res.data;
      const newAccessToken = tokenData.accessToken || tokenData.access_token;
      const newRefreshToken = tokenData.refreshToken || tokenData.refresh_token;
      const expiresIn = tokenData.expiresIn || tokenData.expires_in;

      if (!newAccessToken) {
        forceLogout();
        return Promise.reject(error);
      }

      updateAuthStorage(newAccessToken, newRefreshToken, expiresIn);
      processQueue(null, newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      forceLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;

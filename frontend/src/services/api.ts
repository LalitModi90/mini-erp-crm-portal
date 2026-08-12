import axios from 'axios';

const LOCAL_URL = 'http://localhost:5000';
const PROD_URL = 'https://mini-erp-crm-portal-wsqe.onrender.com';

// ── Auto-detect: local backend chalega to local, warna production ──
async function detectBaseURL(): Promise<string> {
  try {
    await axios.get(`${LOCAL_URL}/api/health`, { timeout: 1500 });
    console.log('%c✅ Local backend detected — using localhost:5000', 'color: green; font-weight: bold');
    return LOCAL_URL;
  } catch {
    console.log('%c🌐 Local backend not found — using Production server', 'color: orange; font-weight: bold');
    return PROD_URL;
  }
}

// Sync placeholder — immediately replaced once detected
export let API_URL: string = import.meta.env.VITE_API_URL || LOCAL_URL;

export const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Detect and update baseURL on app load
detectBaseURL().then((url) => {
  API_URL = url;
  api.defaults.baseURL = `${url}/api`;
});

export const AUTH_UNAUTHORIZED_EVENT = 'auth:unauthorized';

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const hadAuthHeader = Boolean(error.config?.headers?.Authorization);

    if (status === 401 && hadAuthHeader && !window.location.pathname.startsWith('/login')) {
      window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
    }
    return Promise.reject(error);
  }
);

import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';


const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      Cookies.remove('accessToken');
    }
    return Promise.reject(error);
  }
);

export default api;
export const authApi = {
  register: (data: { email: string; password: string; displayName: string; userName: string }) =>
    axios.post(`${BASE_URL}/api/auth/register`, data),
  login: (data: { email: string; password: string }) =>
    axios.post(`${BASE_URL}/api/auth/login`, data),
};

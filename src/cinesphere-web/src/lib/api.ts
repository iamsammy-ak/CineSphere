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

// Notifications
export const notificationsApi = {
  getAll: () => api.get('/notifications'),
  markRead: () => api.post('/notifications/mark-read'),
};

// Watchlist
export const watchlistApi = {
  getAll: () => api.get('/watchlist'),
  add: (data: { tmdbMovieId: number; title: string; posterPath?: string }) => api.post('/watchlist', data),
  remove: (tmdbMovieId: number) => api.delete(`/watchlist/${tmdbMovieId}`),
};

// Discover
export const discoverApi = {
  getDiscover: () => api.get('/discover'),
};

// User Search
export const userSearchApi = {
  search: (query: string) => api.get('/users/search', { params: { query } }),
};

// Follows
export const followsApi = {
  follow: (targetUserId: string) => api.post('/follows', { targetUserId }),
  unfollow: (targetUserId: string) => api.delete(`/follows/${targetUserId}`),
};

// Movie
export const movieApi = {
  getById: (id: string | number) => api.get(`/movies/${id}`),
  getRatings: (id: string | number) => api.get(`/movies/${id}/ratings`),
};

// Posts
export const postsApi = {
  getById: (id: string) => api.get(`/posts/${id}`),
  logMovie: (data: { tmdbMovieId: number; rating: number; watchedDate: string; isRewatch: boolean; content?: string | null; isSpoiler: boolean }) =>
    api.post('/posts/movie-log', data),
};

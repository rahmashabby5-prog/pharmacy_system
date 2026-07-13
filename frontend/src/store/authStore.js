import { create } from 'zustand';
import api from '../utils/api';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  accessToken: localStorage.getItem('access_token') || null,
  loading: false,
  error: null,

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('users/login/', { username, password });
      const { access, refresh, user } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user, accessToken: access, loading: false });
      return { success: true, user };
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Invalid username or password';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    set({ user: null, accessToken: null, error: null });
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      await api.post('users/register/', userData);
      set({ loading: false });
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data ? Object.values(err.response.data).join(' ') : 'Registration failed';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  }
}));

export default useAuthStore;

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// Tasks
export const getTasks = (params) => api.get('/tasks', { params });
export const getTask = (id) => api.get(`/tasks/${id}`);
export const createTask = (data) => api.post('/tasks', data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask = (id, hard = false) => api.delete(`/tasks/${id}`, { params: { hard } });
export const archiveTask = (id) => api.put(`/tasks/${id}/archive`);
export const restoreTask = (id) => api.put(`/tasks/${id}/restore`);
export const duplicateTask = (id) => api.post(`/tasks/${id}/duplicate`);
export const bulkAction = (ids, action) => api.post('/tasks/bulk', { ids, action });
export const updateSubtask = (taskId, subtaskId, data) => api.put(`/tasks/${taskId}/subtasks/${subtaskId}`, data);
export const logTime = (id, minutes) => api.put(`/tasks/${id}/time`, { minutes });
export const getTaskStats = () => api.get('/tasks/stats/overview');

// Users
export const getProfile = () => api.get('/users/profile');
export const updateProfile = (data) => api.put('/users/profile', data);
export const updateSettings = (data) => api.put('/users/settings', data);
export const changePassword = (data) => api.put('/users/password', data);
export const getUserAnalytics = () => api.get('/users/analytics');

// Admin
export const getAllUsers = () => api.get('/admin/users');
export const deactivateUser = (id) => api.put(`/admin/users/${id}/deactivate`);
export const activateUser = (id) => api.put(`/admin/users/${id}/activate`);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const getAllTasks = () => api.get('/admin/tasks');
export const getAnalytics = () => api.get('/admin/analytics');
export const generateReports = (type) => api.get('/admin/reports', { params: { type } });

export default api;

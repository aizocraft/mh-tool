// frontend/src/api.js
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // cookies/sessions
});

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
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const getQuestions = () => api.get('/questions');
export const submitSurvey = (data) => api.post('/submissions', data);
export const getAnalytics = () => api.get('/analytics');
export const createQuestion = (data) => api.post('/questions', data);
export const updateQuestion = (id, data) => api.put(`/questions/${id}`, data);
export const deleteQuestion = (id) => api.delete(`/questions/${id}`);
export const getSubmissions = (filters = {}) =>
  api.get('/submissions', { params: filters }).then(res => res.data);
export const getSubmissionById = (id) =>
  api.get(`/submissions/${id}`).then(res => res.data);
export const updateSubmission = (id, data) =>
  api.put(`/submissions/${id}`, data).then(res => res.data);
export const deleteSubmission = (id) =>
  api.delete(`/submissions/${id}`).then(res => res.data);

export default api;
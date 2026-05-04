import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  getSuppliers: () => api.get('/auth/suppliers'),
};

export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getAll: (params) => api.get('/orders', { params }),
  getMyOrders: () => api.get('/orders/my-orders'),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  updateDeliveryFee: (id, deliveryFeePaid) => api.patch(`/orders/${id}/delivery-fee`, { deliveryFeePaid }),
};

export const tripAPI = {
  create: (data) => api.post('/trips', data),
  getAll: () => api.get('/trips'),
  getById: (id) => api.get(`/trips/${id}`),
  updateStatus: (id, status) => api.patch(`/trips/${id}/status`, { status }),
};

export const supplierAPI = {
  createRequest: (data) => api.post('/suppliers/request', data),
  getMyRequests: () => api.get('/suppliers/my-requests'),
  getAllRequests: () => api.get('/suppliers/requests'),
  submitResponse: (data) => api.post('/suppliers/response', data),
  getResponses: (requestId) => api.get(`/suppliers/responses/${requestId}`),
};

export default api;

import axios from 'axios';
import { API_BASE_URL } from './config';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token expiry - auto logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

// Users API  
export const usersAPI = {
  getAllUsers: (params = {}) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deactivateUser: (id) => api.patch(`/users/${id}/deactivate`),
  deleteUser: (id) => api.delete(`/users/${id}`),
  changePassword: (passwordData) => api.patch('/users/change-password', passwordData),
  updateUserRole: (id, roleData) => api.patch(`/users/${id}/role`, roleData),
};

// Reservations API
export const reservationsAPI = {
  getAllReservations: () => api.get('/reservations'),
  getReservationById: (id) => api.get(`/reservations/${id}`),
  createReservation: (data) => api.post('/reservations', data),
  createReservationAsAdmin: (data) => api.post('/reservations/admin', data), // ← BARU
  updateReservation: (id, data) => api.put(`/reservations/${id}`, data),
  updateReservationStatus: (id, data) => api.put(`/reservations/${id}/status`, data),
  updatePaymentStatus: (id, data) => api.patch(`/reservations/${id}/payment-status`, data), // ← BARU
  cancelReservation: (id) => api.put(`/reservations/${id}/cancel`),
  deleteReservation: (id) => api.delete(`/reservations/${id}`)
};

// Accommodations/Rooms API  
export const accommodationsAPI = {
  getAllAccommodations: () => api.get('/accommodations'),
  getAccommodationById: (id) => api.get(`/accommodations/${id}`),
  createAccommodation: (data) => api.post('/accommodations', data),
  updateAccommodation: (id, data) => api.put(`/accommodations/${id}`, data),
  deleteAccommodation: (id) => api.delete(`/accommodations/${id}`),
};

// Payments API
export const paymentsAPI = {
  // Get payment by reservation ID
  getPaymentByReservation: (reservation_id) => api.get(`/payments/reservation/${reservation_id}`),
  // Create payment
  createPayment: (data) => api.post('/payments', data),
  // Upload transfer proof (kalo masih butuh, tapi lu bilang mau non-aktifin)
  uploadTransferProof: (payment_id, data) => api.patch(`/payments/${payment_id}/transfer-proof`, data),
  // Verify payment (Admin only)
  verifyPayment: (payment_id, data) => api.patch(`/payments/${payment_id}/verify`, data),
  // Update payment status (Admin only)
  updatePaymentStatus: (payment_id, data) => api.patch(`/payments/${payment_id}/status`, data),
  // Get payment history (Admin all, Customer own only)
  getPaymentHistory: (params = {}) => api.get('/payments/history', { params }),
  // Get payment by code
  getPaymentByCode: (code) => api.get(`/payments/code/${code}`),
  // Get my payments (Customer)
  getMyPayments: (params = {}) => api.get('/payments/history/my-payments', { params }),
};

export default api;
// src/api/axios.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://backendpickzo.onrender.com/api', // your backend baseURL
});

// Automatically attach token to headers
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export default instance;

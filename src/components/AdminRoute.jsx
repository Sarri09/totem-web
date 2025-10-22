// src/components/AdminRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function AdminRoute({ children }) {
  const token = localStorage.getItem('jwt');
  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = jwtDecode(token);
    if (decoded.role !== 'admin') return <Navigate to="/dashboard" replace />;
    return children;
  } catch {
    return <Navigate to="/login" replace />;
  }
}

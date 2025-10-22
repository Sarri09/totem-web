import React from 'react';
import { Route, Navigate } from 'react-router-dom';

// Ruta protegida: Si no hay JWT, redirige al login
const PrivateRoute = ({ element: Component, ...rest }) => {
  const token = localStorage.getItem('jwt');

  return (
    <Route
      {...rest}
      element={
        token ? (
          <Component {...rest} />
        ) : (
          <Navigate to="/login" replace />
        )
      }
    />
  );
};

export default PrivateRoute;

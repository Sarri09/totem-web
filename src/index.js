import React from 'react';
import ReactDOM from 'react-dom/client'; // Usar 'react-dom/client' en lugar de 'react-dom'
import App from './App';
import './index.css';

// Usar createRoot en lugar de render
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);  // Aquí es donde se crea la raíz

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

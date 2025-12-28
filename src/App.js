// App.js
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminRoute from './components/AdminRoute';
import AdminCameras from './pages/AdminCameras';
import AdminAssign from './pages/AdminAssign';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* públicas */}
        <Route path="/login" element={<Login />} />

        {/* privadas normales (tu PrivateRoute o simple verificación en cada página) */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* ADMIN */}
        <Route path="/admin/cameras" element={<AdminRoute><AdminCameras /></AdminRoute>} />
        <Route path="/admin/assign" element={<AdminRoute><AdminAssign /></AdminRoute>} />

        {/* default */}
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
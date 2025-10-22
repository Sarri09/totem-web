// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (!token) { navigate('/login'); return; }

    try {
      const decoded = jwtDecode(token);
      setUsername(decoded.username);
      setRole(decoded.role);
    } catch {
      navigate('/login');
      return;
    }

    (async () => {
      try {
        const { data } = await api.get('/api/cameras');
        setCameras(data || []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [navigate]);

  const isAdmin = role === 'admin';

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Hola, {username || 'usuario'}</h2>
        {isAdmin && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => navigate('/admin/rooms')}>Admin: Rooms</button>
            <button onClick={() => navigate('/admin/cameras')}>Admin: Cameras</button>
            <button onClick={() => navigate('/admin/assign')}>Admin: Assign</button>
          </div>
        )}
      </header>

      <section style={{ marginTop: 16 }}>
        <h3>Selecciona una cámara:</h3>

        {cameras.length === 0 ? (
          <div style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
            <p>No tienes cámaras asignadas.</p>
            {isAdmin ? (
              <>
                <p style={{ marginTop: 8 }}>crea sala/cámara y asigna:</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button onClick={() => navigate('/admin/rooms')}>Crear sala</button>
                  <button onClick={() => navigate('/admin/cameras')}>Crear cámara</button>
                  <button onClick={() => navigate('/admin/assign')}>Asignar cámara</button>
                </div>
              </>
            ) : (
              <p>Contacta a un administrador.</p>
            )}
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
            {cameras.map((cam) => (
              <li key={cam.id}>
                <button
                  onClick={() => setSelectedCamera(cam)}
                  style={{ width: '100%', textAlign: 'left', padding: 12, borderRadius: 8, border: '1px solid #ddd' }}
                >
                  <strong>{cam.name}</strong>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    Room: {cam.room_id} · {cam.location || 'sin ubicación'} · {cam.broadcaster_id || 'sin broadcaster'}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {selectedCamera && (
        <section style={{ marginTop: 24 }}>
          <h3>Vista previa: {selectedCamera.name}</h3>
          {/* TODO: aquí integraremos el viewer Mediasoup para consumir el stream real */}
          <div style={{ padding: 20, border: '1px dashed #aaa', borderRadius: 8 }}>
            Aquí irá el reproductor WebRTC (Mediasoup) de la sala asignada.
          </div>
        </section>
      )}
    </div>
  );
}

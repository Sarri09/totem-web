// src/pages/AdminCameras.js
import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function AdminCameras() {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState(''); // Este es el Room ID string
  const [location, setLocation] = useState('');
  const [broadcaster, setBroadcaster] = useState('');
  const [cameras, setCameras] = useState([]);

  const load = async () => {
    // Eliminamos la llamada a /api/rooms que fallaba
    const [r2] = await Promise.all([
      api.get('/api/cameras/all')
    ]);
    setCameras(r2.data);
  };

  useEffect(() => { load(); }, []);

  const createCamera = async (e) => {
    e.preventDefault();
    if (!name || !roomId) return;
    
    await api.post('/api/cameras', {
      name, 
      room_id: roomId, // Enviamos el string (ej. "sala_1")
      location, 
      broadcaster_id: broadcaster || undefined
    });

    setName(''); setRoomId(''); setLocation(''); setBroadcaster('');
    load();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin · Cameras</h2>
      <form onSubmit={createCamera} style={{ display: 'grid', gap: 8, maxWidth: 400 }}>
        <input placeholder="Camera name" value={name} onChange={e=>setName(e.target.value)} required />
        
        {/* Reemplazamos el <select> por un <input> para el ID de la sala */}
        <input 
          placeholder="Room ID (ej: sala_1)" 
          value={roomId} 
          onChange={e => setRoomId(e.target.value)} 
          required
        />

        <input placeholder="Location" value={location} onChange={e=>setLocation(e.target.value)} />
        <input placeholder="Broadcaster ID (ej: raspberry-pi-01)" value={broadcaster} onChange={e=>setBroadcaster(e.target.value)} />
        <button type="submit">Create Camera</button>
      </form>

      <h3 style={{marginTop:16}}>All cameras</h3>
      <ul>
        {cameras.map(c => (
          <li key={c.id}>
            #{c.id} · {c.name} · room:{c.room_id} · broadcaster:{c.broadcaster_id || '-'}
          </li>
        ))}
      </ul>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function AdminCameras() {
  const [rooms, setRooms] = useState([]);
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [location, setLocation] = useState('');
  const [broadcaster, setBroadcaster] = useState('');
  const [cameras, setCameras] = useState([]);

  const load = async () => {
    const [r1, r2] = await Promise.all([
      api.get('/api/rooms'),
      api.get('/api/cameras/all')
    ]);
    setRooms(r1.data);
    setCameras(r2.data);
  };

  useEffect(() => { load(); }, []);

  const createCamera = async (e) => {
    e.preventDefault();
    if (!name || !roomId) return;
    await api.post('/api/cameras', {
      name, room_id: Number(roomId), location, broadcaster_id: broadcaster || undefined
    });
    setName(''); setRoomId(''); setLocation(''); setBroadcaster('');
    load();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin · Cameras</h2>
      <form onSubmit={createCamera} style={{ display: 'grid', gap: 8, maxWidth: 400 }}>
        <input placeholder="Camera name" value={name} onChange={e=>setName(e.target.value)} />
        <select value={roomId} onChange={e=>setRoomId(e.target.value)}>
          <option value="">Select room</option>
          {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <input placeholder="Location" value={location} onChange={e=>setLocation(e.target.value)} />
        <input placeholder="Broadcaster ID (optional)" value={broadcaster} onChange={e=>setBroadcaster(e.target.value)} />
        <button type="submit">Create Camera</button>
      </form>

      <h3 style={{marginTop:16}}>All cameras</h3>
      <ul>
        {cameras.map(c => (
          <li key={c.id}>
            #{c.id} · {c.name} · room:{c.room_name || c.room_id} · broadcaster:{c.broadcaster_id || '-'}
          </li>
        ))}
      </ul>
    </div>
  );
}

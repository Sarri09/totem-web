import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function AdminAssign() {
  const [users, setUsers] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [userId, setUserId] = useState('');
  const [cameraId, setCameraId] = useState('');
  const [perm, setPerm] = useState('view');

  const load = async () => {
    const [u, c] = await Promise.all([
      api.get('/api/users'),
      api.get('/api/cameras/all')
    ]);
    setUsers(u.data);
    setCameras(c.data);
  };

  useEffect(() => { load(); }, []);

  const assign = async (e) => {
    e.preventDefault();
    await api.post('/api/assignments', { user_id: Number(userId), camera_id: Number(cameraId), permissions: perm });
    alert('Assigned!');
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin · Assign camera to user</h2>
      <form onSubmit={assign} style={{ display: 'grid', gap: 8, maxWidth: 400 }}>
        <select value={userId} onChange={e=>setUserId(e.target.value)}>
          <option value="">Select user</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.username} ({u.role})</option>)}
        </select>
        <select value={cameraId} onChange={e=>setCameraId(e.target.value)}>
          <option value="">Select camera</option>
          {cameras.map(c => <option key={c.id} value={c.id}>{c.name} (room {c.room_name || c.room_id})</option>)}
        </select>
        <select value={perm} onChange={e=>setPerm(e.target.value)}>
          <option value="view">view</option>
          <option value="control">control</option>
        </select>
        <button type="submit">Assign</button>
      </form>
    </div>
  );
}

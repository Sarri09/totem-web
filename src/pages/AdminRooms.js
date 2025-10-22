import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function AdminRooms() {
  const [name, setName] = useState('');
  const [rooms, setRooms] = useState([]);
  const [err, setErr] = useState('');

  const load = async () => {
    setErr('');
    try {
      const { data } = await api.get('/api/rooms');
      setRooms(data);
    } catch (e) {
      setErr('Failed to load rooms');
      console.error(e);
    }
  };

  useEffect(() => { load(); }, []);

  const createRoom = async (e) => {
    e.preventDefault();
    setErr('');
    if (!name.trim()) return;
    try {
      await api.post('/api/rooms', { name: name.trim() });
      setName('');
      load();
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || 'Error creating room');
    }
  };

  const ensureOnSFU = async (roomName) => {
    try {
      const { data } = await api.post(`/api/rooms/${encodeURIComponent(roomName)}/ensure`);
      alert(`${roomName}: ${JSON.stringify(data)}`);
    } catch (e) {
      alert(`${roomName}: ${e?.response?.data?.error || e.message}`);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin · Rooms</h2>

      <form onSubmit={createRoom} style={{ marginBottom: 12 }}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="room_1"
        />
        <button type="submit">Create Room</button>
      </form>

      {err && <div style={{ color: 'crimson', marginBottom: 8 }}>{err}</div>}

      <ul>
        {rooms.map((r) => (
          <li key={r.id}>
            {r.id} · {r.name}
            <button
              style={{ marginLeft: 8 }}
              onClick={() => ensureOnSFU(r.name)}
            >
              Ensure on SFU
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

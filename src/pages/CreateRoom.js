import React, { useState } from 'react';
import axios from 'axios';

const CreateRoom = () => {
  const [roomName, setRoomName] = useState('');

  const createRoom = async () => {
    const jwt = localStorage.getItem('jwt');
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE}/api/rooms`,
        { name: roomName },
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      alert('Room created successfully!');
    } catch (error) {
      console.error('Error creating room', error);
    }
  };

  return (
    <div>
      <h2>Create Room</h2>
      <input
        type="text"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        placeholder="Room Name"
      />
      <button onClick={createRoom}>Create</button>
    </div>
  );
};

export default CreateRoom;

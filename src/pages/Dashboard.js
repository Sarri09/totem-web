// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

// --- IMPORTACIONES DE LIVEKIT ---
import { LiveKitRoom, VideoTrack, useTracks } from '@livekit/components-react';
import '@livekit/components-styles';

// --- NUEVO COMPONENTE PARA EL RETORNO DE VIDEO ---
import WebToPiStreamer from '../components/WebToPiStreamer';

// --- COMPONENTE HELPER PARA VISUALIZAR RASPBERRY ---
function PiVideoRenderer({ broadcasterId }) {
  const tracks = useTracks(
    [{ source: 'camera', withMuted: false }],
    { onlySubscribed: true }
  );

  const piTrack = tracks.find(
    (trackRef) => trackRef.participant.identity === broadcasterId
  );

  if (!piTrack) {
    return (
      <div style={{ 
        padding: 20, 
        border: '1px dashed #aaa', 
        borderRadius: 8, 
        background: '#f0f0f0', 
        color: 'red', 
        textAlign: 'center' 
      }}>
        Esperando la señal de la Raspberry Pi ({broadcasterId})...
      </div>
    );
  }
  return <VideoTrack {...piTrack} style={{ width: '100%', borderRadius: 8 }} />;
}
// --- FIN COMPONENTE HELPER ---


export default function Dashboard() {
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  
  // --- ESTADO PARA MODO MANUAL ---
  const [manualRoomId, setManualRoomId] = useState('sala_1'); 
  const [showTestPanel, setShowTestPanel] = useState(false); // Controla la visibilidad del panel

  const navigate = useNavigate();

  // --- ESTADO PARA EL TOKEN DE LIVEKIT ---
  const [liveKitToken, setLiveKitToken] = useState(null);

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

  // --- FUNCIÓN PARA OBTENER TOKEN (SISTEMA NORMAL) ---
  const handleCameraClick = async (cam) => {
    if (selectedCamera && selectedCamera.id === cam.id) {
      setSelectedCamera(null);
      setLiveKitToken(null);
      return;
    }

    setSelectedCamera(cam);
    setLiveKitToken(null); 

    try {
      const { data } = await api.post('/api/livekit/token', {
        room_name: cam.room_id
      });
      setLiveKitToken(data.token);
    } catch (err) {
      console.error('Error fetching LiveKit token', err);
      alert('Error al obtener el token de video.');
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Hola, {username || 'usuario'}</h2>
        
        {/* BOTONERA DE ADMIN */}
        {isAdmin && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowTestPanel(!showTestPanel)}>
              Test connection
            </button>
            <button onClick={() => navigate('/admin/cameras')}>Admin: Cameras</button>
            <button onClick={() => navigate('/admin/assign')}>Admin: Assign</button>
          </div>
        )}
      </header>

      {/* ================================================================= */}
      {/* PANEL DE PRUEBA FORZADA (Solo Admin y si está activo el botón)    */}
      {/* ================================================================= */}
      {isAdmin && showTestPanel && (
        <section style={{ marginTop: 20, padding: 20, border: '2px solid #ccc', background: '#f9f9f9', borderRadius: 10 }}>
          <h3 style={{ marginTop: 0 }}>Test connection (Modo Manual)</h3>
          <p style={{ fontSize: '14px', color: '#555' }}>
          </p>
          
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 15, marginTop: 15 }}>
            <label><strong>ID Sala:</strong></label>
            <input 
              type="text" 
              value={manualRoomId} 
              onChange={(e) => setManualRoomId(e.target.value)}
              style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', flex: 1, maxWidth: 200 }}
            />
          </div>

          <WebToPiStreamer streamId={`${manualRoomId}_retorno`} />
        </section>
      )}
      {/* ================================================================= */}


      <section style={{ marginTop: 30, opacity: showTestPanel ? 0.5 : 1 }}>
        <h3>Selecciona una cámara:</h3>
        {cameras.length === 0 ? (
          <div style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
            <p>No tienes cámaras asignadas.</p>
             {isAdmin ? (
               <p style={{ fontSize: 12 }}>Ve a Admin para crear/asignar cámaras.</p>
             ) : (
               <p>Contacta a un administrador.</p>
             )}
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
            {cameras.map((cam) => (
              <li key={cam.id}>
                <button
                  onClick={() => handleCameraClick(cam)}
                  style={{ 
                    width: '100%', 
                    textAlign: 'left', 
                    padding: 12, 
                    borderRadius: 8, 
                    border: (selectedCamera?.id === cam.id) ? '2px solid blue' : '1px solid #ddd',
                    background: (selectedCamera?.id === cam.id) ? '#f0f5ff' : '#fff'
                  }}
                >
                  <strong>{cam.name}</strong>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    Room: {cam.room_id}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* --- SECCIÓN DE VIDEO DEL SISTEMA AUTOMÁTICO --- */}
      {selectedCamera && (
        <section style={{ marginTop: 24 }}>
          <h3>Vista: {selectedCamera.name}</h3>
          
          {!liveKitToken && (
            <div style={{ padding: 20, border: '1px dashed #aaa', borderRadius: 8, background: '#f9f9f9', textAlign: 'center' }}>
              Conectando a LiveKit...
            </div>
          )}

          {liveKitToken && (
            <LiveKitRoom
              serverUrl={process.env.REACT_APP_LIVEKIT_HOST}
              token={liveKitToken}
              connect={true}
              audio={false}
              video={false}
              onDisconnected={() => {
                setLiveKitToken(null);
                setSelectedCamera(null);
              }}
            >
              <PiVideoRenderer 
                broadcasterId={selectedCamera.broadcaster_id || 'raspberry-pi-01'} 
              />
            </LiveKitRoom>
          )}

          <div style={{ marginTop: 20 }}>
             <h4>Retorno Automático para {selectedCamera.name}</h4>
             <WebToPiStreamer streamId={`${selectedCamera.room_id}_retorno`} />
          </div>

        </section>
      )}
    </div>
  );
}
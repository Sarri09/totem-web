import React, { useEffect, useRef, useState } from 'react';

const SERVER_IP = "18.190.159.57"; 
const WEBRTC_PORT = "8890"; 

export default function WebToPiStreamer({ streamId }) {
  const [status, setStatus] = useState("Listo");
  const [isStreaming, setIsStreaming] = useState(false);
  const localVideoRef = useRef(null);
  const pcRef = useRef(null);

  const startBroadcast = async () => {
    try {
      setStatus("Cargando camara...");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 320, height: 240 }, 
        audio: true 
      });

      localVideoRef.current.srcObject = stream;
      localVideoRef.current.play();

      // --- CAMBIO IMPORTANTE AQUÍ: AGREGAMOS ICE SERVERS (STUN) ---
      const config = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      };
      
      const pc = new RTCPeerConnection(config);
      pcRef.current = pc;
      
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      setStatus("Conectando...");
      
      // Esperar un poco a que se recolecten los candidatos ICE locales
      // (Truco para asegurar mejor conexión antes de enviar la oferta)
      await new Promise(resolve => {
        if (pc.iceGatheringState === 'complete') {
            resolve();
        } else {
            const checkState = () => {
                if (pc.iceGatheringState === 'complete') {
                    pc.removeEventListener('icegatheringstatechange', checkState);
                    resolve();
                }
            };
            pc.addEventListener('icegatheringstatechange', checkState);
            // Timeout de seguridad por si tarda mucho
            setTimeout(resolve, 1000); 
        }
      });

      const endpoint = `http://${SERVER_IP}:${WEBRTC_PORT}/${streamId}/whip`;
      
      // Usamos la descripción local actualizada (con los candidatos ICE)
      const finalOffer = pc.localDescription;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/sdp' },
        body: finalOffer.sdp
      });

      if (response.ok) {
        const answerSdp = await response.text();
        await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: answerSdp }));
        setIsStreaming(true);
        setStatus("En vivo");
      } else {
        setStatus(`Error: ${response.status}`);
      }
    } catch (err) {
      console.error(err);
      setStatus("Error: " + err.message);
    }
  };

  const stopBroadcast = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    setIsStreaming(false);
    setStatus("Detenido");
  };

  useEffect(() => { return () => stopBroadcast(); }, []);

  return (
    <div style={{ marginTop: 20, padding: 15, border: '1px solid #ccc', borderRadius: 8, background: '#f8f9fa' }}>
      <h4 style={{ margin: '0 0 10px 0' }}>Retorno de Audio/Video</h4>
      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <video ref={localVideoRef} style={{ width: 160, background: '#000', borderRadius: 4 }} muted />
        <div>
          <p style={{ fontWeight: 'bold', color: isStreaming ? 'green' : '#666' }}>{status}</p>
          {!isStreaming ? (
            <button onClick={startBroadcast} style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
              Iniciar Retorno
            </button>
          ) : (
            <button onClick={stopBroadcast} style={{ padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
              Detener
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
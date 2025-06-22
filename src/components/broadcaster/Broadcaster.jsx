import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Broadcaster.css';

function Broadcaster() {
  const [localStream, setLocalStream] = useState(null);
  const [pendingPeers, setPendingPeers] = useState([]);
  const [connectedPeers, setConnectedPeers] = useState([]);
  const videoRef = useRef();
  const allPeerConnections = useRef({});
  const peerIdCounter = useRef(0);
  const signalChannel = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    signalChannel.current = new BroadcastChannel('webrtc-signal');

    signalChannel.current.onmessage = (event) => {
      const { type, id, sdp } = event.data;
      if (type === 'answer' && allPeerConnections.current[id]) {
        allPeerConnections.current[id]._setRemoteAnswer(sdp);
      }
    };

    const startStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error('Error accessing media devices', err);
      }
    };
    startStream();

    return () => {
      Object.values(allPeerConnections.current).forEach((pc) => pc.close());
      signalChannel.current?.close();
      localStream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const createOfferForViewer = async () => {
    const id = `viewer-${peerIdCounter.current++}`;
    const pc = new RTCPeerConnection();
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

    const peerData = {
      id,
      connection: pc,
      offerSDP: '',
      answerSDP: '',
      status: 'Gathering ICE...',
    };

    allPeerConnections.current[id] = pc;

    pc.onicecandidate = (event) => {
      if (!event.candidate) {
        const offerSDP = pc.localDescription;
        setPendingPeers((prev) =>
          prev.map((peer) =>
            peer.id === id ? { ...peer, offerSDP: JSON.stringify(offerSDP, null, 2), status: 'Waiting for Answer' } : peer
          )
        );
        signalChannel.current.postMessage({ type: 'offer', id, sdp: offerSDP.toJSON() });
      }
    };

pc.onconnectionstatechange = () => {
  const status = pc.connectionState;

  setPendingPeers((prev) =>
    prev.map((peer) => (peer.id === id ? { ...peer, status } : peer))
  );

  if (status === 'connected') {
    setConnectedPeers((prev) => {
      if (!prev.includes(id)) return [...prev, id];
      return prev;
    });
  }

  if (status === 'disconnected' || status === 'failed' || status === 'closed') {
    setConnectedPeers((prev) => prev.filter((peerId) => peerId !== id));
  }
};


    pc._setRemoteAnswer = async (answerSDP) => {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answerSDP));
      } catch (err) {
        console.error('Failed to set remote answer:', err);
      }
    };

    setPendingPeers((prev) => [...prev, peerData]);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
  };

  const handlePasteAnswer = (id, sdp) => {
    try {
      const answerObj = JSON.parse(sdp);
      const pc = allPeerConnections.current[id];
      pc?._setRemoteAnswer(answerObj);
    } catch (err) {
      alert('Invalid SDP format');
    }
  };

  const handleHangUp = () => {
    Object.values(allPeerConnections.current).forEach((pc) => pc.close());
    allPeerConnections.current = {};
    setPendingPeers([]);
    setConnectedPeers([]);
    if (videoRef.current) videoRef.current.srcObject = null;
    localStream?.getTracks().forEach((track) => track.stop());
    setLocalStream(null);
    alert('Disconnected all viewers.');
    navigate('/');
  };

  return (
    <div className="container">
      <div className="broadcaster-flex-row">
        <div className={`video-column ${pendingPeers.length > 0 ? '' : 'expand'}`}>
          <div className="video-card">
            <div className="video-wrapper">
              <h2 className="overlay-title">Broadcaster</h2>
              <video ref={videoRef} className="styled-video" autoPlay playsInline controls />
            </div>
          </div>
        </div>

        {pendingPeers.length > 0 && (
          <div className="peers-column">
            {pendingPeers.map((peer) => (
              <div className="peer-container" key={peer.id}>
                <h4>{peer.id} — {peer.status}</h4>
                <label className="label">Offer (Send to Viewer):</label>
                <textarea className="text-area" readOnly value={peer.offerSDP} />
                <button className="button" onClick={() => navigator.clipboard.writeText(peer.offerSDP)}>Copy Offer</button>
                <label className="label">Paste Viewer’s Answer:</label>
                <textarea
                  className="text-area"
                  placeholder="Paste answer SDP"
                  onBlur={(e) => handlePasteAnswer(peer.id, e.target.value)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className='broadcaster-buttons'>
        <button className="button" onClick={createOfferForViewer}>Add New Viewer</button>
        <button className="button danger" onClick={handleHangUp}>Hang Up All</button>
      </div>

      <p className="status">Connected Viewers: {connectedPeers.length}</p>
    </div>
  );
}

export default Broadcaster;

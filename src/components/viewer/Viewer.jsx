import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Viewer.css';

function Viewer() {
  const [offerSDP, setOfferSDP] = useState('');
  const [answerSDP, setAnswerSDP] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('Not Connected');
  const videoRef = useRef();
  const peerConnectionRef = useRef(null);
  const signalChannel = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    signalChannel.current = new BroadcastChannel('webrtc-signal');

    signalChannel.current.onmessage = async (event) => {
      const { type, id, sdp } = event.data;
      if (type === 'offer') {
        const pc = new RTCPeerConnection();
        peerConnectionRef.current = pc;

        pc.ontrack = (event) => {
          videoRef.current.srcObject = event.streams[0];
        };

        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        pc.onicecandidate = (event) => {
          if (!event.candidate) {
            const answerSDP = pc.localDescription.toJSON();
            signalChannel.current.postMessage({ type: 'answer', id, sdp: answerSDP });
            setConnectionStatus('Connected');
            setOfferSDP(JSON.stringify(sdp, null, 2));
            setAnswerSDP(JSON.stringify(answerSDP, null, 2));
          }
        };

        pc.onconnectionstatechange = () => {
          setConnectionStatus(pc.connectionState);
        };
      }
    };

    return () => {
      signalChannel.current?.close();
    };
  }, []);

  const handleConnect = async () => {
    try {
      const offer = JSON.parse(offerSDP);
      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      pc.ontrack = (event) => {
        videoRef.current.srcObject = event.streams[0];
      };

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      pc.onicecandidate = (event) => {
        if (!event.candidate) {
          const answer = pc.localDescription;
          setAnswerSDP(JSON.stringify(answer, null, 2));
          setConnectionStatus('Connected');
        }
      };

      pc.onconnectionstatechange = () => {
        setConnectionStatus(pc.connectionState);
      };
    } catch (err) {
      alert('Invalid Offer SDP');
      console.error(err);
    }
  };

  const handleHangUp = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setOfferSDP('');
    setAnswerSDP('');
    setConnectionStatus('Disconnected');
    alert('Disconnected from broadcaster.');
    navigate('/');
  };

  return (
    <div className="container">
      <h2>Viewer</h2>
      <div className="viewer-flex-row">
        <div className="video-column">
          <div className="video-card">
            <div className="video-wrapper">
              <video ref={videoRef} className="styled-video" autoPlay playsInline controls />
            </div>
          </div>
          <div className="button-group">
            <button className="button danger" onClick={handleHangUp}>Hang Up</button>
          </div>
        </div>

        <div className="form-column">
          <label className="label">Paste Broadcaster's SDP Offer:</label>
          <textarea
            className="textarea"
            value={offerSDP}
            onChange={(e) => setOfferSDP(e.target.value)}
            placeholder="Paste broadcaster's SDP here"
          />
          <div className="button-group">
            <button className="button" onClick={handleConnect}>Connect</button>
          </div>
          <label className="label">Your SDP Answer (Send to Broadcaster):</label>
          <textarea
            className="textarea"
            value={answerSDP}
            readOnly
            placeholder="Answer will appear here"
          />
          <div className="button-group">
            <button className="button" onClick={() => navigator.clipboard.writeText(answerSDP)}>Copy Answer</button>
          </div>
          <p className="status">Connection Status: {connectionStatus}</p>
        </div>
      </div>
    </div>
  );
}

export default Viewer;

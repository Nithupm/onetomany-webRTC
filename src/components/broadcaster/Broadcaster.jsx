import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUserPlus, FiMic, FiMicOff, FiPhoneOff } from "react-icons/fi";
import "./Broadcaster.css";

function Broadcaster() {
  const [localStream, setLocalStream] = useState(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [pendingPeers, setPendingPeers] = useState([]);
  const [connectedPeers, setConnectedPeers] = useState([]);
  const videoRef = useRef();
  const allPeerConnections = useRef({});
  const peerIdCounter = useRef(0);
  const signalChannel = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Setup a channel to send/receive connection data between tabs (for testing)
    signalChannel.current = new BroadcastChannel("webrtc-signal");
    
     // Listen for answers from viewers
    signalChannel.current.onmessage = (event) => {
      const { type, id: msgId, sdp } = event.data;
      if (type === "answer" && allPeerConnections.current[msgId]) {
        allPeerConnections.current[msgId]._setRemoteAnswer(sdp);
      }
    };

    const startStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Error accessing media devices", err);
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
      offerSDP: "",
      answerSDP: "",
      status: "Gathering ICE...",
    };

    allPeerConnections.current[id] = pc;
    
    // Wait for all connection data, then send offer
    pc.onicecandidate = (event) => {
      if (!event.candidate) {
        const offerSDP = pc.localDescription;
        setPendingPeers((prev) =>
          prev.map((peer) =>
            peer.id === id
              ? {
                  ...peer,
                  offerSDP: JSON.stringify(offerSDP, null, 2),
                  status: "Waiting for Answer",
                }
              : peer
          )
        );
        signalChannel.current.postMessage({
          type: "offer",
          id,
          sdp: offerSDP.toJSON(),
        });
      }
    };
    
    // Monitor connection state (connected/disconnected)
    pc.onconnectionstatechange = () => {
      const status = pc.connectionState;

      setPendingPeers((prev) =>
        prev.map((peer) =>
          peer.id === id
            ? {
                ...peer,
                status,
                connectedAt: status === "connected" ? Date.now() : peer.connectedAt,
              }
            : peer
        )
      );

      if (status === "connected") {
        setConnectedPeers((prev) =>
          !prev.includes(id) ? [...prev, id] : prev
        );
      }

      if (["disconnected", "failed", "closed"].includes(status)) {
        setConnectedPeers((prev) => prev.filter((peerId) => peerId !== id));
      }
    };
    
    // Viewer will use this to send us their answer
    pc._setRemoteAnswer = async (answerSDP) => {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answerSDP));
      } catch (err) {
        console.error("Failed to set remote answer:", err);
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
      alert("Invalid SDP format");
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
    navigate("/");
  };

  const toggleMic = () => {
    const audioTrack = localStream?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicEnabled(audioTrack.enabled);
    }
  };

  return (
    <div className="container">
      {/* Video and controls part */}
      <div className="broadcaster-flex-row">
        <div className={`video-column ${pendingPeers.length > 0 ? '' : 'expand'}`}>
          <div className="video-card">
            <div className="video-wrapper">
              <h2 className="overlay-title">Broadcaster</h2>
              <video ref={videoRef} className="styled-video" autoPlay playsInline muted />
              <div className="floating-controls">
                <button className="control-button" onClick={createOfferForViewer}>
                  <FiUserPlus />
                </button>
                <button className="control-button" onClick={toggleMic}>
                  {micEnabled ? <FiMic /> : <FiMicOff />}
                </button>
                <button className="control-button danger" onClick={handleHangUp}>
                  <FiPhoneOff />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Offer/Answer exchange part */}
        <div className="peers-column-wrapper">
          {pendingPeers
            .filter((peer) => {
              if (peer.status !== "connected") return true;
              return Date.now() - (peer.connectedAt || 0) < 1000;
            })
            .map((peer) => (
              <div className="peer-container" key={peer.id}>
                <h4>
                  {peer.id}
                  <span
                    className={`status-badge ${
                      peer.status === "connected" ? "connected" : "waiting"
                    }`}
                  >
                    {peer.status === "connected"
                      ? "Connected"
                      : "Waiting for Answer"}
                  </span>
                </h4>

                <label className="label">Offer (Send to Viewer):</label>
                <textarea className="text-area" readOnly value={peer.offerSDP} />
                <button
                  className="button"
                  onClick={() => navigator.clipboard.writeText(peer.offerSDP)}
                >
                  Copy Offer
                </button>

                <label className="label">Paste Viewer’s Answer:</label>
                <textarea
                  className="text-area"
                  placeholder="Paste answer SDP"
                  onBlur={(e) => handlePasteAnswer(peer.id, e.target.value)}
                />
                <button
                  className="button"
                >
                  Done
                </button>
              </div>
            ))}
        </div>
      </div>
      <p className="status">Connected Viewers: {connectedPeers.length}</p>
    </div>
  );
}

export default Broadcaster;

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Viewer.css";
import { FaMicrophone, FaMicrophoneSlash, FaPhoneSlash } from "react-icons/fa";
import Swal from 'sweetalert2';


function Viewer() {
const [offerSDP, setOfferSDP] = useState("");
const [answerSDP, setAnswerSDP] = useState("");
const [connectionStatus, setConnectionStatus] = useState("Not Connected");
const [isMicMuted, setIsMicMuted] = useState(false);
const [copiedAnswer, setCopiedAnswer] = useState(false);
const videoRef = useRef();
const peerConnectionRef = useRef(null);
const signalChannel = useRef(null);
const navigate = useNavigate();

useEffect(() => {
// Listen for offer from broadcaster (auto-connect in test tab setup)
signalChannel.current = new BroadcastChannel("webrtc-signal");
signalChannel.current.onmessage = async (event) => {
const { type, id, sdp } = event.data;
if (type !== "offer") return;
if (peerConnectionRef.current) return;
const pc = new RTCPeerConnection();
peerConnectionRef.current = pc;
pc.ontrack = (event) => {
videoRef.current.srcObject = event.streams[0];
};
await pc.setRemoteDescription(new RTCSessionDescription(sdp));
const answer = await pc.createAnswer();
await pc.setLocalDescription(answer);
// Send answer after ICE is ready
pc.onicecandidate = (event) => {
if (!event.candidate) {
const answerSDP = pc.localDescription.toJSON();
signalChannel.current.postMessage({
type: "answer",
id,
sdp: answerSDP,
});
setConnectionStatus("Connected");
setOfferSDP(JSON.stringify(sdp, null, 2));
setAnswerSDP(JSON.stringify(answerSDP, null, 2));
}
};
pc.onconnectionstatechange = () => {
setConnectionStatus(pc.connectionState);
};
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
const answerSDP = pc.localDescription.toJSON();
setAnswerSDP(JSON.stringify(answerSDP, null, 2));
setConnectionStatus("Connected");
// Send back to broadcaster
if (offer.id) {
signalChannel.current.postMessage({
type: "answer",
id: offer.id,
sdp: answerSDP,
});
}
}
};
pc.onconnectionstatechange = () => {
setConnectionStatus(pc.connectionState);
};
} catch (err) {
Swal.fire({
  icon: 'error',
  title: 'Oops...',
  text: 'Invalid Offer SDP',
});

console.error(err);
}
};

const handleToggleMic = () => {
const tracks = peerConnectionRef.current
?.getSenders()
.filter((s) => s.track?.kind === "audio");
tracks?.forEach((sender) => {
if (sender.track) {
sender.track.enabled = !sender.track.enabled;
}
});
setIsMicMuted((prev) => !prev);
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
setOfferSDP("");
setAnswerSDP("");
setConnectionStatus("Disconnected");
Swal.fire({
  icon: 'info',
  text: 'Disconnected from broadcaster.',
});
navigate("/");
};

return (
<div className="container">
   {/* Remote Video Display part */}
   <h2 className="viewer-title">Viewer</h2>
   <div className="viewer-flex-row">
      <div className="video-column">
         <div className="video-card">
            <div className="video-wrapper">
               <h2 className="overlay-title">Viewer</h2>
               <video
                  ref={videoRef}
                  className="styled-video"
                  autoPlay
                  playsInline
                  muted
                  />
               <div className="floating-controls">
                  <button
                  className="control-button"
                  onClick={handleToggleMic}
                  title={isMicMuted ? "Unmute" : "Mute"}
                  >
                  {isMicMuted ? 
                  <FaMicrophoneSlash />
                  : 
                  <FaMicrophone />
                  }
                  </button>
                  <button
                     className="control-button danger"
                     onClick={handleHangUp}
                     title="Hang Up"
                     >
                     <FaPhoneSlash />
                  </button>
               </div>
            </div>
         </div>
      </div>
      {/* SDP Form Exchange part */}
      <div className="form-column">
         <label className="label">Paste Broadcaster's SDP Offer:</label>
         <textarea
            className="textarea"
            value={offerSDP}
            onChange={(e) =>
         setOfferSDP(e.target.value)}
         placeholder="Paste broadcaster's SDP here"
         />
         <div className="button-group">
            <button className="button" onClick={handleConnect}>
            Connect
            </button>
         </div>
         <label className="label">
         Your SDP Answer (Send to Broadcaster):
         </label>
         <textarea
            className="textarea"
            value={answerSDP}
            readOnly
            placeholder="Answer will appear here"
            />
         <div className="button-group">
            <button
               className="button"
               disabled={copiedAnswer}
               onClick={() => {
            navigator.clipboard.writeText(answerSDP);
            setCopiedAnswer(true);
            }}
            >
            {copiedAnswer ? "Copied" : "Copy Answer"}
            </button>
         </div>
         <p className="status">Connection Status: <span className="status-badge">{connectionStatus}</span></p>
      </div>
   </div>
</div>
);
}
export default Viewer;
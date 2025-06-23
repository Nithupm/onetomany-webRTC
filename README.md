Project: One-to-Many Video Conference (Frontend Only):

This is a frontend-only WebRTC application built using React that allows one user (Broadcaster) to stream their video/audio to multiple other users (Viewers). All signaling is handled manually or via BroadcastChannel for testing in the same browser.

Technologies Used:

1.React (Hooks + Functional Components)
2.WebRTC (RTCPeerConnection API)
3.BroadcastChannel (for same-device testing)
4.CSS

How It Works:

This app allows a single broadcaster to send their media stream to multiple viewers using WebRTC. There is no server involved. Instead, users manually copy and paste SDP offer/answer data between each other to establish the connection.

Core Features:

1.Broadcaster

-Captures the user's camera and mic.
-Displays the local video stream.
-click add icon in the video screen for adding viewer. for every viewer the add icon should be clicked to generate the SDP offer. 
-On clicking "Add Viewer":
  -Creates a new peer connection.
  -Generates and displays an SDP offer.
  -Copy the offer shown and send it to the viewer by pasting in the sdp offer column in the viewer component .
-Waits for and accepts an SDP answer from the viewer.
-Tracks the connection status for each viewer.
-Can mute/unmute microphone.
-Can hang up and disconnect from all viewers.

2.Viewer

-Accepts a pasted SDP offer from the broadcaster.
-Creates a peer connection and generates an SDP answer.
-Sends the answer back to the broadcaster (manually or via BroadcastChannel).
-Displays the broadcaster's video stream.
-Can mute/unmute microphone.
-Can hang up the connection.

3.Auto Signaling (Local Tabs Only)

Uses BroadcastChannel to automatically exchange offers and answers between browser tabs on the same device. This is only for testing without manual copy-paste.

Manual Connection Steps

Step 1: Broadcaster

1.Visit '/broadcaster'.
2.Allow camera/mic access.
3.Click “+” to create a new offer for viewer.
4.Copy the generated offer and send it to the viewer.

Step 2: Viewer

1.Visit '/viewer'.
2.Paste the offer into the textarea.
3.Click “Connect”.
4.Copy the generated answer and send it back to the broadcaster.

Step 3: Broadcaster

1.Paste the viewer's answer into the corresponding field.
2 Connection will be established and the stream will appear on the viewer's side.

Code Overview

Broadcaster.jsx :

-Uses useEffect to get user media and manage cleanup.
-Creates a new RTCPeerConnection per viewer.
-Stores all connections in a useRef map.
-Tracks offer status, connection state, and handles pasted answers.

Viewer.js :

-Accepts an SDP offer, creates a peer connection.
-Generates an answer and displays it.
-Shows the remote stream (broadcaster's video).
-Handles connection state changes and microphone toggling.

App.js :

-Handles routing between '/', '/broadcaster', and '/viewer'.

Cleanup :

-On hang-up, all peer connections are closed.
-All media tracks are stopped.
-UI and state are reset.

Limitations :

-No backend, no TURN server — P2P connection may fail in some networks.
-Only one-way video/audio from broadcaster to viewers.
-Manual signaling unless using tabs on the same machine.

Notes :

-This is meant for local demos and learning WebRTC.
-Use real devices/browsers to simulate copy-paste signaling in production.

Final Output :

-Fully working WebRTC React app
-One-to-many broadcasting
-Manual or tab-based signaling
-Clear UI with status and controls





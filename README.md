<!-- # React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project. -->

# 🎥 One-to-Many WebRTC Video Conference (Frontend-Only)

This is a **frontend-only** WebRTC-based video conferencing application built using **React + Vite**, allowing one broadcaster to stream audio/video to multiple viewers.

---

## 🚀 Features

- ✅ Core WebRTC implementation (no backend)
- ✅ Manual signaling via copy-paste of SDP
- ✅ BroadcastChannel auto-signaling (same device/browser)
- ✅ One-to-many stream from broadcaster to viewers
- ✅ Connection status indicators
- ✅ Full component-based UI with dynamic video list

---

## 📁 Folder Structure

```
webrtc_conference/
├── public/
├── src/
│   ├── components/
│   │   ├── Broadcaster.jsx
│   │   ├── Viewer.jsx
│   └── App.jsx
├── README.md
├── package.json
└── vite.config.js
```

---

## 🧪 How to Run Locally

1. **Install dependencies:**

```bash
npm install
```

2. **Start the dev server:**

```bash
npm run dev
```

3. Open **two tabs** at [http://localhost:5173](http://localhost:5173):
   - Tab 1: Click **"Start as Broadcaster"**
   - Tab 2: Click **"Join as Viewer"**

---

## ✍️ Manual SDP Copy-Paste Flow (if auto signaling fails)

1. In Broadcaster tab, click **"Add New Viewer"**
2. Copy the generated **SDP Offer** and paste it in the **Viewer tab**
3. Viewer generates an **Answer**, copy and paste it back into the Broadcaster’s input box
4. Connection should now be established

---

## 💡 Bonus: BroadcastChannel Auto Signaling

- Works across **multiple tabs** in the **same browser**
- Broadcaster sends `offer` via `BroadcastChannel`
- Viewer auto-generates `answer` and sends back via same channel
- For real users, copy-paste is still required (no backend allowed)

---

## ✅ Implemented Requirements Checklist

| Feature                             | Status       |
|-------------------------------------|--------------|
| React + Component-Based UI          | ✅ Done       |
| Local & Remote `<video>` elements   | ✅ Done       |
| Manual SDP input/output             | ✅ Done       |
| One-to-Many WebRTC with `RTCPeerConnection` | ✅ Done |
| "Start Broadcast", "Connect", "Copy", "Hang Up" buttons | ✅ Done |
| BroadcastChannel Bonus              | ✅ Done       |
| Connection Status UI                | ✅ Done       |
| README Instructions                 | ✅ Done       |

---

## 🛠️ Tech Stack

- React + Vite
- WebRTC APIs (RTCPeerConnection, MediaStream)
- BroadcastChannel API (for same-device signaling)
- No backend used

---




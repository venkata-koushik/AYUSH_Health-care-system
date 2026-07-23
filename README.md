# AYUSH Digital Health

AYUSH is a role-based digital health portal for patients, doctors, student care contributors and government health officials. It includes protected records, consultations, real-time chat/video signalling, QR access and a patient health-information guide.

## Run locally

1. Create a PostgreSQL database, then copy `server/.env.example` to `server/.env` and set the database credentials and a strong `JWT_SECRET`.
2. Install and start the API:

```bash
cd server
npm install
npm run dev
```

3. In a second terminal, start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Deployment checklist

1. Deploy the API to a host that supports persistent WebSockets (for example Render, Railway, Fly.io, or a VPS). Use `npm run dev` only for development; configure the production start command as `node server.js`.
2. Use a managed PostgreSQL database and set every `server/.env.example` value in the host's secret/environment settings. Set `CLIENT_ORIGIN` to the final frontend URL; multiple URLs are comma-separated.
3. Deploy `frontend` as a static Vite site. Set `VITE_API_URL` to `https://your-api-domain/api` and `VITE_SOCKET_URL` to `https://your-api-domain`, then build with `npm run build`.
4. Use HTTPS for both frontend and API. Browser camera/microphone access and reliable WebRTC require a secure context outside localhost.
5. Configure a TURN server for real-world video calls. The included Google STUN servers are enough for many local tests but cannot reliably cross restrictive corporate/mobile NATs. A TURN service such as coturn or a managed provider is required before production launch.
6. Replace all example credentials, do not commit `.env`, rotate any exposed keys, and verify patient/doctor/student/government login flows with production URLs.
7. Back up the database, enable host logs and monitoring, and change `sequelize.sync({ alter: true })` to managed migrations before handling real patient data.

The API health-check endpoint is `GET /health`; configure your hosting provider to use it.

## Video-call testing

Test with one patient and one student account in separate browser profiles/devices. Allow camera and microphone for both. Once both participants join, the status should move from **Connecting** to **Connected**. If both local previews work but remote video does not, verify WebSocket connectivity and TURN configuration first.

## Verification

```bash
cd frontend && npm run build
cd ../server && node --check server.js && node --check src/sockets/socket.js
```

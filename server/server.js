import app, { databaseReady } from "./src/app.js";
import { createServer } from "node:http";
import { Server } from "socket.io";
import registerSocketHandlers from "./src/sockets/socket.js";

const PORT = Number(process.env.PORT) || 5001;
const clientOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

databaseReady
  .then(() => {
    const httpServer = createServer(app);

    const io = new Server(httpServer, {
      cors: {
        origin: clientOrigins,
        methods: ["GET", "POST"],
      },
    });

    registerSocketHandlers(io);

    httpServer.on("error", (error) => {
      console.error(`Unable to start server on port ${PORT}:`, error.message);
      process.exitCode = 1;
    });

    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(() => {
    process.exitCode = 1;
  });

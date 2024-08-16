import { Server as ServerIO } from "socket.io";
import { NextApiResponseServerIo } from "@/types/socketio";
import { NextApiRequest } from "next";
import logger from "@/lib/logger";
import { initializeSocketAuth } from "@/lib/socket-auth";
import { setupSocketEvents } from "@/lib/socket-events";

const log = logger.child({ route: "/api/socketio" });

export const config = { api: { bodyParser: false } };

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
  try {
    if (!res.socket.server.io) {
      log.info("Initializing new Socket.io instance");
      const io = new ServerIO(res.socket.server as any, {
        path: "/api/socketio",
        addTrailingSlash: false,
        cors: {
          origin: process.env.NEXT_PUBLIC_BASE_URL,
          credentials: true,
        },
      });

      initializeSocketAuth(io, log);

      io.on("connection", (socket) => {
        log.info("New client connected", socket.id);
        
        // Subscribe user to their own room
        const userId = socket.data.user.id;
        socket.join(`user:${userId}`);
        log.info(`User ${userId} joined room user:${userId}`);

        setupSocketEvents(socket, log);

        socket.on("disconnect", () => {
          log.info("Client disconnected", socket.id);
        });
      });

      res.socket.server.io = io;
    } else {
      log.info("Socket.io instance already initialized");
    }
    res.end();
  } catch (error) {
    log.error("Error in ioHandler:", error);
    res.status(500).end();
  }
};

export default ioHandler;
        
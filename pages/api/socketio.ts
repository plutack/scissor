import { Server as ServerIO } from "socket.io";
import * as userService from "../../services/user-service";
import { NextApiResponseServerIo } from "@/types/socketio";
import { NextApiRequest } from "next";
import logger from "@/lib/logger";

const log = logger.child({ route: "/api/socketio" });

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
  try {
    // Check if the socket server is already initialized
    log.info("Checking if socket.io instance is already initialized");
    if (!res.socket.server.io) {
      log.info("Initializing new Socket.io instance");
      const io = new ServerIO(res.socket.server as any, {
        path: "/api/socketio",
        addTrailingSlash: false,
        cors: {
          origin: process.env.NEXTAUTH_URL,
          credentials: true,
        },
      });

      io.use(async (socket, next) => {
        try {
          log.info("Authenticating socket connection");
          const { userId, email, role } = socket.handshake.auth;
          log.info("socket.handshake.auth:", socket.handshake.auth);

          if (!userId || !email || !role) {
            throw new Error("Missing authentication data");
          }

          socket.data.user = { id: userId, email, role };
          log.info("socket user object set");
          next();
        } catch (error) {
          log.error("Socket authentication failed:", error);
          next(new Error("Authentication failed"));
        }
      });

      io.on("connection", (socket) => {
        log.info("New client connected", socket.id);

        socket.on("getDashboardData", async () => {
          log.info("Received getDashboardData request from client");
          try {
            const dashboardData = await userService.getUserStats(
              socket.data.user.id,
            );
            log.info("Sending dashboard data event to client");
            socket.emit("dashboardData", dashboardData);
          } catch (error) {
            log.error("Error fetching dashboard data:", error);
            socket.emit("dashboardError", "Failed to fetch dashboard data");
          }
        });
        socket.on("disconnect", () => {
          log.info("Client disconnected", socket.id);
        });
      });

      // Assign the io instance to the response object
      res.socket.server.io = io;
      log.info("Socket.io instance assigned to res.socket.server.io");
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

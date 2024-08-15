import { Server as ServerIO } from "socket.io";
import * as userService from "../../services/user-service";
import { NextApiResponseServerIo } from "@/types/socketio";
import { NextApiRequest } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
  console.log("ioHandler called");

  try {
    // Check if the socket server is already initialized
    console.log("Checking if socket.io instance is already initialized");
    if (!res.socket.server.io) {
      console.log("Initializing new Socket.io instance");
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
          console.log("Authenticating socket connection");
          console.log("socket.handshake.auth:", socket.handshake.auth);
          const { userId, email, role } = socket.handshake.auth;

          if (!userId || !email || !role) {
            throw new Error("Missing authentication data");
          }

          socket.data.user = { id: userId, email, role };
          console.log("Authenticated user:", socket.data.user);
          next();
        } catch (error) {
          console.error("Authentication failed:", error);
          next(new Error("Authentication failed"));
        }
      });

      io.on("connection", (socket) => {
        console.log("New client connected", socket.id);
        console.log("Connected user:", socket.data.user);

        // Test event for debugging
        socket.on("testEvent", (data) => {
          console.log("Received testEvent:", data);
          socket.emit("testResponse", "Server received your test event");
        });

        socket.on("getDashboardData", async () => {
          console.log("Received getDashboardData request");
          try {
            const dashboardData = await userService.getUserStats(
              socket.data.user.id,
            );
            console.log("Sending dashboard data:", dashboardData);
            socket.emit("dashboardData", dashboardData);
          } catch (error) {
            console.error("Error fetching dashboard data:", error);
            socket.emit("dashboardError", "Failed to fetch dashboard data");
          }
        });

        socket.on("disconnect", () => {
          console.log("Client disconnected", socket.id);
        });
      });

      // Assign the io instance to the response object
      res.socket.server.io = io;
      console.log("Socket.io instance assigned to res.socket.server.io");
    } else {
      console.log("Socket.io instance already initialized");
    }
    res.end();
  } catch (error) {
    console.error("Error in ioHandler:", error);
    res.status(500).end();
  }
};

export default ioHandler;

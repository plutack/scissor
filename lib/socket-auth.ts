import { Server } from "socket.io";

export const initializeSocketAuth = (io: Server, log: any) => {
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
};
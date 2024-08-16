import { initializeSocketIO } from "@/lib/socketio";
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
    log.info("ioHandler called");
    if (!res.socket.server.io) {
      log.info("Initializing new Socket.io instance");
      const io = initializeSocketIO(res.socket.server);
      res.socket.server.io = io;
    } else {
      log.info("Socket.io instance already initialized");
    }
    res.end();
  } catch (error) {
    log.error("Error in ioHandler", { error });
    res.status(500).end();
  }
};

export default ioHandler;

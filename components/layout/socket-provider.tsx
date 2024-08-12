"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io as ClientIO, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  isLoading: boolean;
};

export const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  isLoading: true,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;

    if (session?.user && !socket) {
      console.log("Initializing socket connection for user:", session.user.id);
      console.log("next public base url ", process.env.NEXT_PUBLIC_BASE_URL )
      const socketInstance = new (ClientIO as any)(process.env.NEXT_PUBLIC_BASE_URL!, {
        path: "/api/socketio",
        auth: {
          userId: session.user.id,
          email: session.user.email,
          role: session.user.role,
        },
      });

      socketInstance.on("connect", () => {
        console.log("Socket connected");
        setIsConnected(true);
        setIsLoading(false);
      });

      socketInstance.on("connect_error", (error: any) => {
        console.error("Connection Error:", error.message);
        setIsConnected(false);
        setIsLoading(false);
      });

      socketInstance.on("disconnect", (reason: any) => {
        console.log("Disconnected from Socket.io server:", reason);
        setIsConnected(false);
      });

      setSocket(socketInstance);
    } else if (!session?.user) {
      setIsLoading(false);
    }
  }, [session, socket, status]);

  useEffect(() => {
    return () => {
      if (socket) {
        console.log("Disconnecting socket");
        socket.disconnect();
      }
    };
  }, [socket]);

  console.log("Render - Session status:", status);
  console.log("Render - Session data:", session);
  console.log("Render - Socket:", socket);
  console.log("Render - IsConnected:", isConnected);
  console.log("Render - IsLoading:", isLoading);

  return (
    <SocketContext.Provider value={{ socket, isConnected, isLoading }}>
      {children}
    </SocketContext.Provider>
  );
};

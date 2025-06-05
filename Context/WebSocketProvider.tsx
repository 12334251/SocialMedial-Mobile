import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";
import * as SecureStore from "expo-secure-store";
import { useAuth } from "./AuthContext";

interface WebSocketContextValue {
  socket: Socket | null;
  sendMessage: (event: string, data: any) => void;
}

const WebSocketContext = createContext<WebSocketContextValue | undefined>(
  undefined
);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!user?._id) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const setupSocket = async () => {
      const userId = await SecureStore.getItemAsync("userId");
      console.log("setupSocket", userId);
      if (!userId) {
        console.log("No userId found in SecureStore – please login first");
        return;
      }

      const api = process.env.EXPO_PUBLIC_BASE_API_DEFAULT_PATH;

      const newSocket = io(api, {
        path: "/api/socket",
        withCredentials: true,
        query: { userId },
        reconnection: true,
        reconnectionAttempts: Infinity, // keep trying
        reconnectionDelay: 1000, // first retry after 1s
        reconnectionDelayMax: 5000, // max 5s between retries
      });

      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log(`Socket connected for user ${userId}`);
        newSocket.emit("registerUser", { userId });
      });

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected");
      });
    };

    setupSocket();

    return () => {
      socket?.disconnect();
      setSocket(null);
    };
  }, [user?._id]); // run once on mount :contentReference[oaicite:3]{index=3}

  const sendMessage = useCallback(
    (event: string, data: any) => {
      if (socket) socket.emit(event, data);
    },
    [socket]
  );

  return (
    <WebSocketContext.Provider value={{ socket, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context)
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  return context;
};

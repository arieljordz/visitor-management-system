// context/SocketContext.js
import { createContext, useContext, useEffect } from "react";
import socket from "../utils/socket";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.userId && user?.role) {
      const joinRoom = () => {
        socket.emit("join", {
          userId: user.userId,
          role: user.role,
        });
      };

      joinRoom(); // emit immediately if connected
      socket.on("connect", joinRoom);

      // Sample notification handler
      socket.on("notification", (message) => {
        console.log("🔔 New notification:", message);
      });

      return () => {
        socket.off("connect", joinRoom);
        socket.off("notification");
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

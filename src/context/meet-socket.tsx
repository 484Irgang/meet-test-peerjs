import { Room } from "@/types/room";
import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

type MeetSocketContextProps = {
  createRoom: (newRoom: Room) => void;
};

const MeetSocketContext = createContext({} as MeetSocketContextProps);

export default function MeetSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [socket, setSocket] = useState<Socket | null>(null);

  const createRoom = (newRoom: Room) => {
    try {
      if (!socket?.active) throw new Error("Socket is not active");
      socket.emit("create-room", newRoom);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const newSocket = io("ws://localhost:8080");
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <MeetSocketContext.Provider value={{ createRoom }}>
      {children}
    </MeetSocketContext.Provider>
  );
}

export const useMeetSocket = () => useContext(MeetSocketContext);

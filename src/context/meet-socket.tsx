"use client";

import { useRoomStore } from "@/store/room";
import { useUserStore } from "@/store/user";
import { Room } from "@/types/room";
import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

type MeetSocketContextProps = {
  createRoom: (newRoom: Room) => void;
  requestToJoinRoom: (roomId: string) => void;
  socketActive: boolean;
};

const MeetSocketContext = createContext({} as MeetSocketContextProps);

export default function MeetSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const userId = useUserStore((state) => state.userId);
  const setRoom = useRoomStore((state) => state.setRoom);

  const createRoom = (newRoom: Room) => {
    try {
      if (!socket?.active) throw new Error("Socket is not active");
      socket.emit("create-room", newRoom);
      setRoom(newRoom);
    } catch (error) {
      console.error(error);
    }
  };

  const requestToJoinRoom = (roomId: string) => {
    try {
      if (!socket?.active) throw new Error("Socket is not active");
      socket.emit("request-join-room", roomId, userId);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const newSocket = io("ws://localhost:8080");
    setSocket(newSocket);

    newSocket.on("joined-room", (room: Room) => {
      setRoom(room);
    });

    return () => {
      newSocket.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MeetSocketContext.Provider
      value={{ socketActive: !!socket?.active, createRoom, requestToJoinRoom }}
    >
      {children}
    </MeetSocketContext.Provider>
  );
}

export const useMeetSocket = () => useContext(MeetSocketContext);

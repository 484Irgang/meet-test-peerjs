"use client";

import { usePeerClientStore } from "@/store/peer-client";
import { useRoomStore } from "@/store/room";
import { useUserStore } from "@/store/user";
import { Room } from "@/types/room";
import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

type MeetSocketContextProps = {
  createRoom: (newRoom: Room) => void;
  requestToJoinRoom: (roomId: string) => void;
  sharePeerIdToRoom: (roomId: string, peerId: string) => void;
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
  const setRemotePeerId = usePeerClientStore((state) => state.appendRemotePeer);

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

  const sharePeerIdToRoom = (roomId: string, peerId: string) => {
    try {
      if (!socket?.active) throw new Error("Socket is not active");
      socket.emit("share-peer-id", roomId, userId, peerId);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const newSocket = io("wss://enhanced-dory-smiling.ngrok-free.app", {
      transports: ["websocket"],
    });
    setSocket(newSocket);

    newSocket.on("joined-room-successfully", (room: Room) => {
      setRoom(room);
    });

    newSocket.on("peer-id-shared", (peerId: string) => {
      setRemotePeerId(peerId);
    });

    return () => {
      newSocket.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MeetSocketContext.Provider
      value={{
        socketActive: !!socket?.active,
        createRoom,
        requestToJoinRoom,
        sharePeerIdToRoom,
      }}
    >
      {children}
    </MeetSocketContext.Provider>
  );
}

export const useMeetSocket = () => useContext(MeetSocketContext);

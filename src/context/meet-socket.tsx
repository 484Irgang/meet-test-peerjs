"use client";

import { TrackObject } from "@/services/cloudflare_calls/types";
import { RemoteSession, useCallStore } from "@/store/call-store";
import { useRoomStore } from "@/store/room";
import { Room } from "@/types/room";
import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

type MeetSocketContextProps = {
  createRoom: (newRoom: Room) => void;
  requestToJoinRoom: (roomId: string, userId: string) => void;
  shareSessionToRoom: (
    roomId: string,
    sessionId: { id: string; tracks: TrackObject[] },
    userId: string
  ) => void;
  socketActive: boolean;
};

const MeetSocketContext = createContext({} as MeetSocketContextProps);

export default function MeetSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const setRoom = useRoomStore((state) => state.setRoom);
  const appendRemoteSession = useCallStore(
    (state) => state.appendRemoteSession
  );

  const createRoom = (newRoom: Room) => {
    try {
      if (!socket?.active) throw new Error("Socket is not active");
      socket.emit("create-room", newRoom);
      setRoom(newRoom);
    } catch (error) {
      console.error(error);
    }
  };

  const requestToJoinRoom = (roomId: string, userId: string) => {
    try {
      if (!socket?.active) throw new Error("Socket is not active");
      socket.emit("request-join-room", { roomId, userId });
    } catch (error) {
      console.error(error);
    }
  };

  const shareSessionToRoom = (
    roomId: string,
    session: { id: string; tracks: TrackObject[] },
    userId: string
  ) => {
    try {
      if (!socket?.active) throw new Error("Socket is not active");
      socket.emit("share-call-session", { roomId, userId, session });
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
      console.log("Joined room successfully", room);
      setRoom(room);
    });

    newSocket.on("receive-call-session", (session: RemoteSession) => {
      console.log("Received call session", session);
      appendRemoteSession(session);
    });

    newSocket.on("receive-all-room-sessions", (sessions: RemoteSession[]) => {
      console.log("Received all room sessions", sessions);
      sessions.forEach((session) => {
        appendRemoteSession(session);
      });
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
        shareSessionToRoom,
      }}
    >
      {children}
    </MeetSocketContext.Provider>
  );
}

export const useMeetSocket = () => useContext(MeetSocketContext);

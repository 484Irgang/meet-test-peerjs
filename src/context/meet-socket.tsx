"use client";

import { useRoomStore } from "@/store/room";
import { useUserStore } from "@/store/user";
import { Room } from "@/types/room";
import { IUser } from "@/types/user";
import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

type MeetSocketContextProps = {
  createRoom: (newRoom: Room) => void;
  requestToJoinRoom: (roomId: string, user: IUser) => void;
  socketActive: boolean;
};

const MeetSocketContext = createContext({} as MeetSocketContextProps);

export default function MeetSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [socket, setSocket] = useState<Socket | null>(null);

  const room = useRoomStore((state) => state.room);
  const setRoom = useRoomStore((state) => state.setRoom);

  const user = useUserStore((state) => state.user);
  const appendRoomUser = useRoomStore((state) => state.appendRoomUser);

  const createRoom = (newRoom: Room) => {
    try {
      if (!socket?.active) throw new Error("Socket is not active");
      socket.emit("create-room", newRoom);
      setRoom(newRoom);
    } catch (error) {
      console.error(error);
    }
  };

  const requestToJoinRoom = (roomId: string, user: IUser) => {
    try {
      if (!socket?.active) throw new Error("Socket is not active");
      socket.emit("request-join-room", { roomId, user });
    } catch (error) {
      console.error(error);
    }
  };

  const updateUser = (socket: Socket, roomId: string, user: IUser) => {
    try {
      if (!socket?.active) throw new Error("Socket is not active");
      socket.emit("update-call-user", { roomId, user });
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

    newSocket.on("user-updated", (updatedUser: IUser) => {
      if (updatedUser.id !== user?.id) appendRoomUser(updatedUser);
    });

    return () => {
      newSocket.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (socket?.active && room?.id && user?.id) {
      updateUser(socket, room.id, user);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, room?.id, socket?.active]);

  useEffect(() => {
    if (socket?.active && room?.id) {
      const interval = setInterval(() => {
        socket.emit("heartbeat", room.id);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [socket, room?.id]);

  return (
    <MeetSocketContext.Provider
      value={{
        socketActive: !!socket?.active,
        createRoom,
        requestToJoinRoom,
      }}
    >
      {children}
    </MeetSocketContext.Provider>
  );
}

export const useMeetSocket = () => useContext(MeetSocketContext);

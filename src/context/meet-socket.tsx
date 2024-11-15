"use client";

import { useRemoteStreamTracksStore } from "@/store/remote-stream-tracks";
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
  handleRemoveUserFromRoom: (user: IUser) => void;
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
  const updateRoomUser = useRoomStore((state) => state.updateRoomUser);
  const removeRoomUser = useRoomStore((state) => state.removeRoomUser);
  const cleanRemoteTracks = useRemoteStreamTracksStore(
    (state) => state.cleanRemoteTracks
  );

  const handleVerifyUsersInRoom = (users: IUser[]) => {
    const user = useUserStore.getState().user;
    const roomUsers = useRoomStore.getState().roomUsers;
    const userIds = users.map((u) => u.id);

    const usersToUpdate: IUser[] = users.filter((u) => u.id !== user?.id);

    const usersToRemove = Object.values(roomUsers ?? {}).filter(
      (user) => !userIds.includes(user.id)
    );

    usersToUpdate.forEach((u) => updateRoomUser(u));

    usersToRemove.forEach(handleRemoveUserFromRoom);
  };

  const handleRemoveUserFromRoom = (user: IUser) => {
    removeRoomUser(user.id);
    cleanRemoteTracks(user.sessionId);
  };

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
      setRoom(room);
    });

    newSocket.on("user-updated", (updatedUser: IUser) => {
      const user = useUserStore.getState().user;
      if (updatedUser.id !== user?.id) updateRoomUser(updatedUser);
    });

    newSocket.on("user-disconnected", (user: IUser) => {
      removeRoomUser(user.id);
      cleanRemoteTracks(user.sessionId);
    });

    newSocket.on("room-state", (room: Room) => {
      const roomUsers = room.users || [];
      handleVerifyUsersInRoom(roomUsers);
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
        handleRemoveUserFromRoom,
      }}
    >
      {children}
    </MeetSocketContext.Provider>
  );
}

export const useMeetSocket = () => useContext(MeetSocketContext);

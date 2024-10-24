"use client";
import MeetSocketProvider, { useMeetSocket } from "@/context/meet-socket";
import { Room } from "@/types/room";
import { v4 } from "uuid";

const Button = () => {
  const { createRoom } = useMeetSocket();

  const handleCreateRoom = () => {
    const newId = v4();

    const newRoom: Room = {
      id: newId,
      name: "Sala de reunião",
      admin: {
        name: "Guilherme",
      },
      insertedAt: new Date().toISOString(),
    };

    return createRoom(newRoom);
  };

  return (
    <button
      className="w-full h-[2.75rem] rounded-sm border border-neutral-400 mt-2"
      onClick={handleCreateRoom}
    >
      Criar uma sala
    </button>
  );
};

export const CreateRoomButton = () => {
  return (
    <MeetSocketProvider>
      <Button />
    </MeetSocketProvider>
  );
};

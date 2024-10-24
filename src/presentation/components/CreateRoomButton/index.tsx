"use client";
import { useMeetSocket } from "@/context/meet-socket";
import { useUserStore } from "@/store/user";
import { Room } from "@/types/room";
import { useRouter } from "next/navigation";
import { v4 } from "uuid";

export const CreateRoomButton = () => {
  const { createRoom } = useMeetSocket();
  const router = useRouter();
  const userId = useUserStore((state) => state.userId);

  const handleCreateRoom = () => {
    const newId = v4();

    const newRoom: Room = {
      id: newId,
      name: "Sala de reunião",
      admin: {
        id: userId,
        name: "Guilherme",
      },
      insertedAt: new Date().toISOString(),
    };

    createRoom(newRoom);
    return router.push(`/room/${newId}`);
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

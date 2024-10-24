"use client";
import { v4 } from "uuid";

import { useMeetSocket } from "@/context/meet-socket";
import { useUserStore } from "@/store/user";
import { Room } from "@/types/room";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Index() {
  const [roomId, setRoomId] = useState<string>();
  const setUserId = useUserStore((state) => state.setUserId);

  const { createRoom } = useMeetSocket();
  const router = useRouter();
  const userId = useUserStore((state) => state.userId);

  const verifyUserId = () => {
    const userId = localStorage?.getItem("user_id");
    if (!userId) {
      const newUserId = v4();
      localStorage.setItem("user_id", newUserId);
      return setUserId(newUserId);
    }

    setUserId(userId);
  };

  const handleEnterRoom = () => router.push(`/room/${roomId}`);

  const handleCreateRoom = () => {
    const newId = v4();

    const newRoom: Room = {
      id: newId,
      name: "Sala de reunião",
      admin: {
        id: userId || v4(),
        name: "Guilherme",
      },
      insertedAt: new Date().toISOString(),
    };

    createRoom(newRoom);
    return router.push(`/room/${newId}`);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => verifyUserId(), []);

  return (
    <div className="w-full h-full bg-dark-300 flex flex-1 items-center flex-col relative">
      <img
        alt="background"
        className="absolute bottom-0 w-full max-w-[60vw] object-contain opacity-30"
        src="background_gray.svg"
      />
      <div className="mt-[20vh] p-4 rounded-lg bg-dark-200 flex items-center justify-center flex-col gap-y-4 border border-neutral-1000 z-10">
        <h1 className="font-bold text-brand-600">DWV MEET</h1>
        <h1 className="text-[1.75rem] font-bold">Bem vindo</h1>
        <div className="w-full min-w-60 flex flex-col gap-y-2">
          <p className="font-bold text-sm text-neutral-400">
            Insira o ID da sala:{" "}
          </p>
          <input
            type="text"
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full rounded-sm border border-neutral-900 bg-dark-100 h-8 outline-none pl-2"
          />
          <button
            disabled={!roomId}
            className="w-full h-[2.75rem] rounded-sm bg-brand-600 mt-4"
            onClick={handleEnterRoom}
          >
            Entrar
          </button>
          <button
            className="w-full h-[2.75rem] rounded-sm border border-neutral-400 mt-2"
            onClick={handleCreateRoom}
          >
            Criar uma sala
          </button>
        </div>
      </div>
    </div>
  );
}

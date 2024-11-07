"use client";

import { useMeetSocket } from "@/context/meet-socket";
import { useRoomStore } from "@/store/room";
import { useUserStore } from "@/store/user";
import { useEffect, useRef } from "react";
import { RoomPreparation } from "./content/RoomPreparation";

export default function RoomPage({ roomId }: { roomId: string }) {
  const room = useRoomStore((state) => state.room);
  const alreadySendRoomRequest = useRef(false);
  const user = useUserStore((state) => state.user);

  const { requestToJoinRoom, socketActive } = useMeetSocket();

  // const remoteStreams = useRemoteStreamStore((state) => state.remoteStreams);

  useEffect(() => {
    if (
      socketActive &&
      !alreadySendRoomRequest.current &&
      !room?.id &&
      user?.id
    ) {
      requestToJoinRoom(roomId, user.id);
      alreadySendRoomRequest.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketActive, room?.id, user?.id]);

  if (!room?.id)
    return (
      <div className="w-full h-full bg-dark-300 flex items-center justify-center flex-col gap-y-2">
        <div className="w-10 h-10 rounded-all border-2 border-b-0 border-t-0 border-brand-500 animate-spin" />
        <h1>Aguarde um momento, solicitando permissão para entrar na sala</h1>
      </div>
    );

  return <RoomPreparation room={room} />;
}

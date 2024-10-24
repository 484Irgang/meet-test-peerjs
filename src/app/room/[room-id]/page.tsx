"use client";

import { useMeetSocket } from "@/context/meet-socket";
import { useUserMedia } from "@/hooks/user-media";
import { useRoomStore } from "@/store/room";
import { use, useEffect } from "react";

export default function RoomPage({
  params,
}: {
  params: Promise<{ "room-id": string }>;
}) {
  const room = useRoomStore((state) => state.room);

  const { requestToJoinRoom, socketActive } = useMeetSocket();
  const roomId = use(params)["room-id"];

  useEffect(() => {
    if (socketActive) requestToJoinRoom(roomId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketActive]);

  if (!room?.id)
    return (
      <div className="w-full h-full bg-dark-300 p-6 flex items-center justify-center flex-col gap-y-2">
        <div className="w-10 h-10 rounded-all border-2 border-b-0 border-t-0 border-brand-500 animate-spin" />
        <h1>Aguarde um momento, solicitando permissão para entrar na sala</h1>
      </div>
    );

  return (
    <div className="w-full h-full bg-dark-300 p-6 pb-12 flex">
      <div className="h-full w-2/3 flex flex-col gap-y-4">
        <h1 className="text-lg font-medium">{room.name}</h1>
        <div className="flex flex-1 gap-4 flex-wrap">
          <UserMediaStream />
        </div>
      </div>
    </div>
  );
}

const UserMediaStream = () => {
  const { userVideoRef } = useUserMedia();
  return (
    <div className="flex-1 w-full h-full max-w-[50rem] max-h-[30rem] bg-neutral-1000 rounded-md">
      <video className="w-full h-full" ref={userVideoRef} autoPlay />
    </div>
  );
};

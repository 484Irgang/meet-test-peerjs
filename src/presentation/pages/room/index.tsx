"use client";

import { useMeetSocket } from "@/context/meet-socket";
import {
  LocalMediaStream,
  RemoteMediaStream,
} from "@/presentation/components/LocalMediaStream";
import { useRemoteStreamStore } from "@/store/remote-stream";
import { useRoomStore } from "@/store/room";
import { toPairs } from "ramda";
import { useEffect, useRef } from "react";

export default function RoomPage({ roomId }: { roomId: string }) {
  const room = useRoomStore((state) => state.room);
  const alreadySendRoomRequest = useRef(false);

  const { requestToJoinRoom, socketActive } = useMeetSocket();

  const remoteStreams = useRemoteStreamStore((state) => state.remoteStreams);

  useEffect(() => {
    if (socketActive && !alreadySendRoomRequest.current && !room?.id) {
      requestToJoinRoom(roomId);
      alreadySendRoomRequest.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketActive, room?.id]);

  if (!room?.id)
    return (
      <div className="w-full h-full bg-dark-300 flex items-center justify-center flex-col gap-y-2">
        <div className="w-10 h-10 rounded-all border-2 border-b-0 border-t-0 border-brand-500 animate-spin" />
        <h1>Aguarde um momento, solicitando permissão para entrar na sala</h1>
      </div>
    );

  return (
    <div className="w-full h-full bg-dark-300 flex p-4 overflow-auto">
      <div className="h-full w-full flex flex-col gap-4 flex-wrap">
        <h1 className="text-xl font-bold w-full">{room.name}</h1>
        <div className="flex flex-1 gap-4 flex-wrap content-start">
          <LocalMediaStream />
          {remoteStreams &&
            toPairs(remoteStreams).map(([peerId, stream]) => (
              <RemoteMediaStream key={peerId} stream={stream} />
            ))}
        </div>
      </div>
    </div>
  );
}

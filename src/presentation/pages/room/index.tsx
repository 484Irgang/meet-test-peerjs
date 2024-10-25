"use client";

import { useMeetSocket } from "@/context/meet-socket";
import {
  LocalMediaStream,
  RemoteMediaStream,
} from "@/presentation/components/LocalMediaStream";
import { usePeerClientStore } from "@/store/peer-client";
import { useRemoteStreamStore } from "@/store/remote-stream";
import { useRoomStore } from "@/store/room";
import { toPairs } from "ramda";
import { useEffect } from "react";

export default function RoomPage({ roomId }: { roomId: string }) {
  const room = useRoomStore((state) => state.room);

  const { requestToJoinRoom, socketActive, sharePeerIdToRoom } =
    useMeetSocket();

  const myPeerId = usePeerClientStore((state) => state.myPeerId);
  const remoteStreams = useRemoteStreamStore((state) => state.remoteStreams);

  useEffect(() => {
    if (myPeerId && socketActive && room?.id)
      sharePeerIdToRoom(room.id, myPeerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myPeerId, socketActive, room?.id]);

  useEffect(() => {
    if (socketActive) requestToJoinRoom(roomId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketActive]);

  console.log(remoteStreams);

  if (!room?.id)
    return (
      <div className="w-full h-full bg-dark-300 flex items-center justify-center flex-col gap-y-2">
        <div className="w-10 h-10 rounded-all border-2 border-b-0 border-t-0 border-brand-500 animate-spin" />
        <h1>Aguarde um momento, solicitando permissão para entrar na sala</h1>
      </div>
    );

  return (
    <div className="w-full h-full bg-dark-300 flex px-10 py-4 overflow-hidden">
      <div className="h-full w-3/5 flex flex-col gap-y-4">
        <h1 className="text-lg font-medium">{room.name}</h1>
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

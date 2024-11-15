"use client";

import { useMeetSocket } from "@/context/meet-socket";
import PeerClientProvider from "@/context/peer-client/index.";
import { useLocalTracksStore } from "@/store/local-stream-tracks";
import { useRoomStore } from "@/store/room";
import { useUserStore } from "@/store/user";
import { Fragment, useEffect, useRef } from "react";
import CallRoom from "./content/CallRoom";
import { RoomPreparation } from "./content/RoomPreparation";

export default function RoomPage({
  params,
}: {
  params: { "room-id": string };
}) {
  const roomId = params["room-id"];

  const alreadySendRoomRequest = useRef(false);

  const room = useRoomStore((state) => state.room);
  const user = useUserStore((state) => state.user);
  const updateUser = useUserStore((state) => state.updateUser);
  const updateUserMedia = useUserStore((state) => state.updateUserMedia);

  const setAllowed = useLocalTracksStore(
    (state) => state.setStreamAccessAllowed
  );
  const streamAllowed = useLocalTracksStore(
    (state) => state.streamAccessAllowed
  );
  const stopTracks = useLocalTracksStore((state) => state.stopTracks);

  const { requestToJoinRoom, socketActive, handleRemoveUserFromRoom } =
    useMeetSocket();

  const handleEnterRoom = () => {
    const { mutated, showCamera } = useLocalTracksStore.getState();
    updateUser({ joined: true });
    updateUserMedia({ audioEnabled: !mutated, cameraEnabled: !!showCamera });
  };

  const handleExitRoom = () => {
    updateUser({ joined: false });
  };

  useEffect(() => {
    if (
      socketActive &&
      !alreadySendRoomRequest.current &&
      !room?.id &&
      user?.id
    ) {
      requestToJoinRoom(roomId, user);
      alreadySendRoomRequest.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketActive, room?.id, user?.id]);

  useEffect(() => {
    return () => {
      stopTracks("all");
      const user = useUserStore.getState().user;
      if (user?.id) handleRemoveUserFromRoom(user);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!room?.id || !user?.id)
    return (
      <div className="w-full h-full bg-dark-300 flex items-center justify-center flex-col gap-y-2">
        <div className="w-10 h-10 rounded-all border-2 border-b-0 border-t-0 border-brand-500 animate-spin" />
        <h1>Aguarde um momento, solicitando permissão para entrar na sala</h1>
      </div>
    );

  return (
    <Fragment>
      {streamAllowed ? (
        <PeerClientProvider streamAllowed={streamAllowed}>
          {user?.joined ? (
            <CallRoom roomId={room.id} endCall={handleExitRoom} />
          ) : (
            <RoomPreparation onEnterRoom={handleEnterRoom} room={room} />
          )}
        </PeerClientProvider>
      ) : (
        <section className="w-full h-full flex-1 flex flex-col gap-y-4 bg-dark-300 items-center justify-center">
          <div className="flex flex-col gap-y-4">
            <h1 className="text-white max-w-[320px] font-light">
              Para usar o DWV Meets, você precisará conceder permissão à sua
              câmera e microfone. Você será solicitado a acessar.
            </h1>
            <button
              onClick={() => setAllowed(true)}
              className="py-4 px-8 max-w-fit rounded-sm text-neutral-0 font-medium bg-brand-600"
            >
              Liberar acesso
            </button>
          </div>
        </section>
      )}
    </Fragment>
  );
}

"use client";

import { useMeetSocket } from "@/context/meet-socket";
import PeerClientProvider from "@/context/peer-client";
import CallButton, {
  CallButtonIconTypes,
} from "@/presentation/components/CallButton";
import { useLocalStreamStore } from "@/store/local-stream";
import { useRoomStore } from "@/store/room";
import { useUserStore } from "@/store/user";
import { Fragment, useEffect, useRef } from "react";
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

  const setAllowed = useLocalStreamStore(
    (state) => state.setStreamAccessAllowed
  );
  const streamAllowed = useLocalStreamStore(
    (state) => state.streamAccessAllowed
  );

  const { requestToJoinRoom, socketActive } = useMeetSocket();

  const handleEnterRoom = () => {
    updateUser({ joined: true });
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
            <CallRoom />
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

type CallButtons = {
  icon: CallButtonIconTypes;
};

const callButtons: CallButtons[] = [
  { icon: "microphone" },
  { icon: "video" },
  { icon: "share-screen" },
  { icon: "end-call" },
];

export const CallRoom = () => {
  return (
    <div className="flex-1 flex w-full h-full bg-dark-300 flex-col">
      <div className="flex-1 bg-brand-100" />
      <div className="w-full flex p-5 items-center justify-center gap-4 bg-dark-100">
        {callButtons.map((button, index) => (
          <CallButton
            key={index}
            icon={button.icon}
            iconSize={14}
            className={`py-3 px-5 ${
              button.icon === "end-call" && "!bg-orange-600"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

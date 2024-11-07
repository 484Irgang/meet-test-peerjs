"use client";

import PeerClientProvider from "@/context/peer-client";
import RoomPageTemplate from "@/presentation/pages/room";
import { useLocalStreamStore } from "@/store/local-stream";
import { Fragment, useEffect } from "react";

export default function RoomPage({
  params,
}: {
  params: { "room-id": string };
}) {
  const roomId = params["room-id"];

  const streamAllowed = useLocalStreamStore(
    (state) => state.streamAccessAllowed
  );
  const setAllowed = useLocalStreamStore(
    (state) => state.setStreamAccessAllowed
  );
  const setStreamTracks = useLocalStreamStore((state) => state.setStreamTracks);

  const handleGetLocalStreamTracks = async () => {
    const userStream = await navigator?.mediaDevices?.getUserMedia({
      audio: true,
      video: true,
    });

    const audioTracks = userStream.getAudioTracks();
    const videoTracks = userStream.getVideoTracks();

    setStreamTracks("audio")(audioTracks);
    setStreamTracks("video")(videoTracks);
  };

  useEffect(() => {
    if (streamAllowed) handleGetLocalStreamTracks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamAllowed]);

  return (
    <Fragment>
      {streamAllowed ? (
        <PeerClientProvider>
          <RoomPageTemplate roomId={roomId} />
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

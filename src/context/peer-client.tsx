"use client";

import { useLocalStreamStore } from "@/store/local-stream";
import { usePeerClientStore } from "@/store/peer-client";
import { useRemoteStreamStore } from "@/store/remote-stream";
import Peer from "peerjs";
import { createContext, useContext, useEffect, useState } from "react";

type PeerClientProps = {
  onConnect?: () => void;
  peerClient: Peer | null;
};

const PeerClientContext = createContext<PeerClientProps>({} as PeerClientProps);

export default function PeerClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [peerClient, setPeerClient] = useState<Peer | null>(null);

  const setMyId = usePeerClientStore((state) => state.setMyPeerId);
  const remotePeers = usePeerClientStore((state) => state.remotePeers);
  const setRemoteStream = useRemoteStreamStore(
    (state) => state.setRemoteStream
  );

  const myStream = useLocalStreamStore((state) => state.stream);

  const onConnect = () => {
    const client = new Peer();
    setPeerClient(client);
    client.on("open", (id: string) => setMyId(id));
    client.on("call", async (call) => {
      try {
        const stream =
          myStream ||
          (await navigator?.mediaDevices?.getUserMedia({
            audio: true,
            video: true,
          }));

        call.answer(stream);
        call.on("stream", (stream) => setRemoteStream(call.peer, stream));
      } catch (error) {
        console.error(error);
      }
    });
  };

  const startPeerCall = (myPeer: Peer) => (remotePeerId: string) => {
    try {
      if (!myStream) throw new Error("My stream is not available");
      const call = myPeer.call(remotePeerId, myStream);
      call.on("stream", (stream) => setRemoteStream(remotePeerId, stream));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    onConnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (remotePeers && peerClient?.id) {
      remotePeers.forEach(startPeerCall(peerClient));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remotePeers, peerClient?.id]);

  return (
    <PeerClientContext.Provider value={{ onConnect, peerClient }}>
      {children}
    </PeerClientContext.Provider>
  );
}

export const usePeerClient = () => useContext(PeerClientContext);

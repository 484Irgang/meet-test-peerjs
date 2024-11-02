"use client";

import { useUserMedia } from "@/hooks/user-media";
import { CallsService } from "@/services/cloudflare_calls";
import { TrackObject } from "@/services/cloudflare_calls/types";
import { RemoteSession, useCallStore } from "@/store/call-store";
import { useRemoteStreamStore } from "@/store/remote-stream";
import { useRoomStore } from "@/store/room";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useMeetSocket } from "./meet-socket";

type PeerClientProps = {
  peerClient: RTCPeerConnection | null;
};

const PeerClientContext = createContext<PeerClientProps>({} as PeerClientProps);

export default function PeerClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [peerClient, setPeerClient] = useState<RTCPeerConnection | null>(null);
  const [myTransceivers, setMyTransceivers] = useState<RTCRtpTransceiver[]>([]);
  const [connected, setConnected] = useState(false);

  const localTracksSended = useRef(false);

  const { sessionId, setSessionId, remoteSessions } = useCallStore();
  const room = useRoomStore((state) => state.room);

  const { socketActive, shareSessionToRoom } = useMeetSocket();

  const { setRemoteStream, remoteStreams } = useRemoteStreamStore();

  const { localStream } = useUserMedia(sessionId);

  const onStartPeer = async () => {
    try {
      const { data, error } = await CallsService.session.createCallSession();
      if (!data?.sessionId)
        throw new Error(error?.message || "Error creating session");
      setSessionId(data.sessionId);

      const peerConnection = new RTCPeerConnection({
        iceServers: [
          {
            urls: "stun:stun.cloudflare.com:3478",
          },
        ],
        bundlePolicy: "max-bundle",
      });

      setPeerClient(peerConnection);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendTracksToSession = async (
    sessionId: string,
    peer: RTCPeerConnection,
    stream: MediaStream
  ) => {
    try {
      const newTransceivers = stream
        .getTracks()
        .map((track) => peer.addTransceiver(track, { streams: [stream] }));
      await peer.createOffer().then((offer) => peer.setLocalDescription(offer));

      setMyTransceivers(newTransceivers);

      const sessionTracks: TrackObject[] = newTransceivers?.map(
        ({ mid, sender }) => ({
          location: "local" as const,
          mid,
          trackName: sender?.track?.id ?? "",
        })
      );

      const { data, error } =
        await CallsService.tracks.addLocalTracksToCallSession(
          sessionId,
          sessionTracks,
          peer.localDescription
        );

      if (!data) throw new Error(error?.message || "Error sending tracks");

      const connected = new Promise((res, rej) => {
        // timeout after 5s
        setTimeout(rej, 5000);
        const iceConnectionStateChangeHandler = () => {
          console.log(
            "iceConnectionStateChangeHandler",
            peer.iceConnectionState
          );
          if (peer.iceConnectionState === "connected") {
            peer.removeEventListener(
              "iceconnectionstatechange",
              iceConnectionStateChangeHandler
            );
            res(undefined);
          }
        };
        peer.addEventListener(
          "iceconnectionstatechange",
          iceConnectionStateChangeHandler
        );
      });

      await peerClient?.setRemoteDescription(
        new RTCSessionDescription(data.sessionDescription)
      );

      await connected;
      setConnected(true);

      console.log("successfully connected", { data, error });
    } catch (error) {
      console.error(error);
    }
  };

  const getRemoteSession =
    (mySessionId: string) => async (remoteSession: RemoteSession) => {
      try {
        const remoteStream = remoteStreams?.[remoteSession.id];

        if (remoteStream)
          return console.log("Remote stream already exists", remoteStream);

        if (!localStream?.active) throw new Error("My stream is not available");

        const tracksToPull: TrackObject[] = remoteSession.tracks?.map(
          (track) => ({
            location: "remote",
            trackName: track.trackName,
            sessionId: remoteSession.id,
          })
        );

        const { data: remoteTracksData, error: remoteTracksError } =
          await CallsService.tracks.getRemoteTracksFromCallSession(
            mySessionId,
            tracksToPull
          );

        if (!remoteTracksData || !peerClient)
          throw new Error(
            remoteTracksError?.message ||
              "Error getting remote tracks or local peer not connected"
          );

        const resolvingTracks = Promise.all(
          remoteTracksData.tracks.map(
            ({ mid }) =>
              new Promise<MediaStreamTrack>((res, rej) => {
                setTimeout(rej, 5000);
                const handleTrack = ({ transceiver, track }: RTCTrackEvent) => {
                  if (transceiver.mid !== mid) return;
                  peerClient.removeEventListener("track", handleTrack);
                  res(track);
                };
                peerClient.addEventListener("track", handleTrack);
              })
          )
        );

        if (remoteTracksData.requiresImmediateRenegotiation) {
          await peerClient.setRemoteDescription(
            remoteTracksData.sessionDescription
          );
          const remoteAnswer = await peerClient.createAnswer();
          await peerClient.setLocalDescription(remoteAnswer);

          const { error } = await CallsService.session.renegotiateCallSession(
            mySessionId,
            new RTCSessionDescription(remoteAnswer)
          );
          if (error) {
            throw new Error(error?.message || "Error renegotiating session");
          }
        }

        const pulledTracks = await resolvingTracks;
        const remoteVideoStream = new MediaStream();

        pulledTracks.forEach((track) => {
          remoteVideoStream.addTrack(track);
        });

        setRemoteStream(remoteSession.id, remoteVideoStream);

        const myTracks: TrackObject[] = myTransceivers?.map(
          ({ mid, sender }) => ({
            location: "local",
            mid,
            trackName: sender?.track?.id ?? "",
          })
        );

        if (room?.id && myTracks?.length)
          shareSessionToRoom(room.id, { id: mySessionId, tracks: myTracks });
      } catch (error) {
        console.error(error);
      }
    };

  useEffect(() => {
    onStartPeer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      localStream?.active &&
      peerClient &&
      sessionId &&
      !localTracksSended.current
    ) {
      handleSendTracksToSession(sessionId, peerClient, localStream);
      localTracksSended.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localStream?.active, peerClient, sessionId]);

  useEffect(() => {
    if (remoteSessions?.length && sessionId && connected && room?.id) {
      remoteSessions.forEach(getRemoteSession(sessionId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remoteSessions, sessionId, connected, room?.id]);

  useEffect(() => {
    if (
      sessionId &&
      socketActive &&
      room?.id &&
      connected &&
      myTransceivers?.length
    ) {
      const tracks: TrackObject[] = myTransceivers.map(({ mid, sender }) => ({
        location: "local",
        mid,
        trackName: sender?.track?.id ?? "",
      }));
      shareSessionToRoom(room.id, { id: sessionId, tracks });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, socketActive, room?.id, connected, myTransceivers]);

  return (
    <PeerClientContext.Provider value={{ peerClient }}>
      {children}
    </PeerClientContext.Provider>
  );
}

export const usePeerClient = () => useContext(PeerClientContext);

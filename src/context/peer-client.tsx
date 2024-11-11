"use client";

import { CallsService } from "@/services/cloudflare_calls";
import { TrackObject } from "@/services/cloudflare_calls/types";
import { useLocalStreamStore } from "@/store/local-stream";
import { useRoomStore } from "@/store/room";
import { useUserStore } from "@/store/user";
import { PromiseFeedback } from "@/types/responses";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useMeetSocket } from "./meet-socket";

type PeerClientProps = {
  peerClient: RTCPeerConnection | null;
};

const PeerClientContext = createContext<PeerClientProps>({} as PeerClientProps);

export default function PeerClientProvider({
  children,
  streamAllowed,
}: {
  children: React.ReactNode;
  streamAllowed: boolean;
}) {
  const [peerClient, setPeerClient] = useState<RTCPeerConnection | null>(null);
  const [myTransceivers, setMyTransceivers] = useState<RTCRtpTransceiver[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const localTracksSended = useRef(false);
  const sessionCreated = useRef(false);

  const room = useRoomStore((state) => state.room);
  const user = useUserStore((state) => state.user);

  const { socketActive, shareSessionToRoom } = useMeetSocket();
  const setStreamTracks = useLocalStreamStore((state) => state.setStreamTracks);

  const handleStartConnection = async () => {
    try {
      const promises = [generateSessionPeer(), getLocalStreamTracks()];

      const [sessionPeerResponse, localStreamTracks] = (await Promise.all(
        promises
      )) as [GenerateSessionPeerResponse, MediaStreamTraks[]];

      if (!sessionPeerResponse.peer || !sessionPeerResponse.sessionId)
        throw new Error("Error starting peer connection");

      setPeerClient(sessionPeerResponse.peer);
      setSessionId(sessionPeerResponse.sessionId);

      const { success, data } = await sendTracksToSession(
        sessionPeerResponse.sessionId,
        sessionPeerResponse.peer,
        localStreamTracks
      );

      if (!success || !data?.connected)
        throw new Error("Error sending tracks to session");

      setConnected(data.connected);
      setMyTransceivers(data.transceivers);

      console.log("Tracks successfully sent to session", data);
    } catch (error) {
      console.error(error);
    }
  };

  const getLocalStreamTracks = async () => {
    const userStream = await navigator?.mediaDevices?.getUserMedia({
      audio: true,
      video: true,
    });

    const audioTracks = userStream.getAudioTracks();
    const videoTracks = userStream.getVideoTracks();

    setStreamTracks("audio")(audioTracks);
    setStreamTracks("video")(videoTracks);

    return [...audioTracks, ...videoTracks];
  };

  // const getRemoteSessionTracks = async (
  //   mySessionId: string,
  //   remoteSessions: RemoteSession[]
  // ) => {
  //   try {
  //     console.log("Get remote session tracks", remoteSessions);

  //     if (!localStream?.active) throw new Error("My stream is not available");

  //     const tracksToPull = remoteSessions.reduce<TrackObject[]>(
  //       (acc, session) => {
  //         const remoteStream = remoteStreams?.[session.id];
  //         if (remoteStream?.active) return acc;
  //         const tracks: TrackObject[] = session.tracks.map(({ trackName }) => ({
  //           location: "remote",
  //           trackName: trackName,
  //           sessionId: session.id,
  //         }));
  //         acc.push(...tracks);
  //         return acc;
  //       },
  //       []
  //     );

  //     const { data: remoteTracksData, error: remoteTracksError } =
  //       await CallsService.tracks.getRemoteTracksFromCallSession(
  //         mySessionId,
  //         tracksToPull
  //       );

  //     if (!remoteTracksData || !peerClient)
  //       throw new Error(
  //         remoteTracksError?.message ||
  //           "Error getting remote tracks or local peer not connected"
  //       );

  //     const resolvingTracks = Promise.all(
  //       remoteTracksData.tracks.map(
  //         ({ mid, sessionId }) =>
  //           new Promise<{ sessionId: string; track: MediaStreamTrack }>(
  //             (res, rej) => {
  //               setTimeout(rej, 5000);
  //               const handleTrack = ({ transceiver, track }: RTCTrackEvent) => {
  //                 console.log("Handle track on peer", {
  //                   transceiver,
  //                   track,
  //                   sessionId,
  //                 });
  //                 if (transceiver.mid !== mid || !sessionId) return;
  //                 peerClient.removeEventListener("track", handleTrack);
  //                 res({ sessionId, track });
  //               };
  //               peerClient.addEventListener("track", handleTrack);
  //             }
  //           )
  //       )
  //     );

  //     if (remoteTracksData.requiresImmediateRenegotiation) {
  //       console.log("Creating answer for remote tracks");
  //       await peerClient.setRemoteDescription(
  //         remoteTracksData.sessionDescription
  //       );
  //       const remoteAnswer = await peerClient.createAnswer();
  //       await peerClient.setLocalDescription(remoteAnswer);

  //       const { error } = await CallsService.session.renegotiateCallSession(
  //         mySessionId,
  //         new RTCSessionDescription(remoteAnswer)
  //       );
  //       if (error) {
  //         throw new Error(error?.message || "Error renegotiating session");
  //       }
  //     }

  //     const pulledTracks = await resolvingTracks;

  //     const normalizedSessionTracks = pulledTracks.reduce<{
  //       [sessionId: string]: MediaStreamTrack[];
  //     }>((acc, track) => {
  //       if (!acc[track.sessionId]) acc[track.sessionId] = [];
  //       acc[track.sessionId].push(track.track);
  //       return acc;
  //     }, {});

  //     toPairs(normalizedSessionTracks).forEach(([sessionId, tracks]) => {
  //       const remoteVideoStream = new MediaStream();
  //       tracks.forEach((track) => {
  //         remoteVideoStream.addTrack(track);
  //       });
  //       setRemoteStream(sessionId, remoteVideoStream);
  //     });

  //     return console.log(
  //       "Successfully pulled remote tracks",
  //       normalizedSessionTracks
  //     );
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  useEffect(() => {
    if (!sessionCreated.current && streamAllowed) {
      handleStartConnection();
      sessionCreated.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamAllowed]);

  // useEffect(() => {
  //   if (
  //     localStreamTracks?.length &&
  //     peerClient &&
  //     sessionId &&
  //     !localTracksSended.current &&
  //     room?.id
  //   ) {
  //     handleSendTracksToSession(sessionId, peerClient, localStreamTracks);
  //     localTracksSended.current = true;
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [localStreamTracks?.length, peerClient, sessionId, room?.id]);

  // useEffect(() => {
  //   if (remoteSessions?.length && sessionId && connected && room?.id) {
  //     console.log("Updated remote sessions", remoteSessions);
  //     getRemoteSessionTracks(sessionId, remoteSessions);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [remoteSessions, sessionId, connected, room?.id]);

  // useEffect(() => {
  //   if (
  //     sessionId &&
  //     user?.id &&
  //     socketActive &&
  //     room?.id &&
  //     connected &&
  //     myTransceivers?.length
  //   ) {
  //     console.log("Share session to room", sessionId);
  //     const tracks: TrackObject[] = myTransceivers.map(({ mid, sender }) => ({
  //       location: "local",
  //       mid,
  //       trackName: sender?.track?.id ?? "",
  //     }));
  //     shareSessionToRoom(room.id, { id: sessionId, tracks }, user.id);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [
  //   sessionId,
  //   socketActive,
  //   room?.id,
  //   connected,
  //   myTransceivers?.length,
  //   user?.id,
  // ]);

  return (
    <PeerClientContext.Provider value={{ peerClient }}>
      {children}
    </PeerClientContext.Provider>
  );
}

export const usePeerClient = () => useContext(PeerClientContext);

type GenerateSessionPeerResponse = {
  peer: RTCPeerConnection | null;
  sessionId: string | null;
  error?: Error;
};
const generateSessionPeer = async (): Promise<GenerateSessionPeerResponse> => {
  try {
    const { data, error } = await CallsService.session.createCallSession();
    if (!data?.sessionId)
      throw new Error(error?.message || "Error creating session");

    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.cloudflare.com:3478",
        },
      ],
      bundlePolicy: "max-bundle",
    });

    return { peer, sessionId: data.sessionId };
  } catch (error) {
    console.error(error);
    return { peer: null, sessionId: null, error: error as unknown as Error };
  }
};

type SendTracksResponse = {
  connected: boolean;
  transceivers: RTCRtpTransceiver[];
};

const sendTracksToSession = async (
  sessionId: string,
  peer: RTCPeerConnection,
  localTracks: MediaStreamTrack[]
): Promise<PromiseFeedback<SendTracksResponse>> => {
  console.log("Send tracks to session", sessionId);

  try {
    const newTransceivers = localTracks.map((track) =>
      peer.addTransceiver(track)
    );
    await peer.createOffer().then((offer) => peer.setLocalDescription(offer));

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
      setTimeout(rej, 5000);
      const iceConnectionStateChangeHandler = () => {
        console.log("iceConnectionStateChangeHandler", peer.iceConnectionState);
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

    await peer.setRemoteDescription(
      new RTCSessionDescription(data.sessionDescription)
    );

    await connected;

    return {
      success: true,
      data: { connected: true, transceivers: newTransceivers },
    };
  } catch (error) {
    console.error(error);
    return { success: false, error: error as unknown as Error };
  }
};

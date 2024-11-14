"use client";

import { CallsService } from "@/services/cloudflare_calls";
import { TrackObject } from "@/services/cloudflare_calls/types";
import { useLocalTracksStore } from "@/store/local-stream-tracks";
import {
  RemoteRoomTracks,
  useRemoteStreamTracksStore,
} from "@/store/remote-stream-tracks";
import { RoomUsers, useRoomStore } from "@/store/room";
import { useUserStore } from "@/store/user";
import { PromiseFeedback } from "@/types/responses";
import { isEmpty, toPairs } from "ramda";
import { createContext, useContext, useEffect, useRef, useState } from "react";

type PeerClientProps = {
  peerClient: RTCPeerConnection | null;
  connected: boolean;
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
  // const [myTransceivers, setMyTransceivers] = useState<RTCRtpTransceiver[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const sessionCreated = useRef(false);

  const roomUsers = useRoomStore((state) => state.roomUsers);
  const room = useRoomStore((state) => state.room);
  const updateUser = useUserStore((state) => state.updateUser);
  const setStreamTracks = useLocalTracksStore((state) => state.setStreamTracks);
  const setRemoteTracks = useRemoteStreamTracksStore(
    (state) => state.setRemoteTracks
  );

  const handleStartConnection = async () => {
    try {
      const promises = [generateSessionPeer(), getLocalStreamTracks()];

      const [sessionPeerResponse, localStreamTracks] = (await Promise.all(
        promises
      )) as [GenerateSessionPeerResponse, MediaStreamTrack[]];

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
      // setMyTransceivers(data.transceivers);
      updateUser({
        sessionId: sessionPeerResponse.sessionId,
        media: {
          audioEnabled: false,
          cameraEnabled: false,
          screenEnabled: false,
          sessionTracks: data.tracks,
        },
      });

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

  const normalizeRemoteUsersTracks = async (
    mySessionId: string,
    remoteUsers: RoomUsers
  ) => {
    try {
      console.log("Normalize remote session tracks", remoteUsers);

      const remoteTracks = useRemoteStreamTracksStore.getState().remoteTracks;

      const tracksToPull = generateTracksToPull(remoteUsers, remoteTracks);

      if (!tracksToPull?.length) return;

      const pulledTracks = await pullRemoteUsersTracks({
        mySessionId,
        tracksToPull,
        peerClient,
      });

      const normalizedSessionTracks = pulledTracks.reduce<{
        [sessionId: string]: MediaStreamTrack[];
      }>((acc, track) => {
        if (!acc[track.sessionId]) acc[track.sessionId] = [];
        acc[track.sessionId].push(track.track);
        return acc;
      }, {});

      toPairs(normalizedSessionTracks).forEach(([sessionId, tracks]) => {
        setRemoteTracks(sessionId, tracks);
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!sessionCreated.current && streamAllowed) {
      handleStartConnection();
      sessionCreated.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamAllowed]);

  useEffect(() => {
    if (
      roomUsers &&
      !isEmpty(roomUsers) &&
      sessionId &&
      connected &&
      room?.id
    ) {
      normalizeRemoteUsersTracks(sessionId, roomUsers);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomUsers, sessionId, connected, room?.id]);

  return (
    <PeerClientContext.Provider value={{ peerClient, connected }}>
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
  tracks: TrackObject[];
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
        location: "local",
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
      data: {
        connected: true,
        transceivers: newTransceivers,
        tracks: sessionTracks,
      },
    };
  } catch (error) {
    console.error(error);
    return { success: false, error: error as unknown as Error };
  }
};

const generateTracksToPull = (
  remoteUsers: RoomUsers,
  remoteTracks: RemoteRoomTracks
) =>
  Object.values(remoteUsers).reduce<TrackObject[]>((acc, user) => {
    const remoteTracksStored =
      user?.sessionId && !!remoteTracks?.[user.sessionId]?.length;

    const pullUserTracks =
      !remoteTracksStored &&
      user?.sessionId &&
      !!user?.joined &&
      !!user?.media?.sessionTracks?.length;

    if (!pullUserTracks) return acc;

    const tracks: TrackObject[] =
      user?.media?.sessionTracks.map(({ trackName }) => ({
        location: "remote",
        trackName: trackName,
        sessionId: user.sessionId,
      })) ?? [];

    acc.push(...tracks);
    return acc;
  }, []);

type PullRemoteTracksPayload = {
  mySessionId: string;
  tracksToPull: TrackObject[];
  peerClient: RTCPeerConnection | null;
};

const pullRemoteUsersTracks = async ({
  mySessionId,
  tracksToPull,
  peerClient,
}: PullRemoteTracksPayload) => {
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
      ({ mid, sessionId }) =>
        new Promise<{ sessionId: string; track: MediaStreamTrack }>(
          (res, rej) => {
            setTimeout(rej, 5000);
            const handleTrack = ({ transceiver, track }: RTCTrackEvent) => {
              console.log("Handle track on peer", {
                transceiver,
                track,
                sessionId,
              });
              if (transceiver.mid !== mid || !sessionId) return;
              peerClient.removeEventListener("track", handleTrack);
              res({ sessionId, track });
            };
            peerClient.addEventListener("track", handleTrack);
          }
        )
    )
  );

  if (remoteTracksData.requiresImmediateRenegotiation) {
    console.log("Creating answer for remote tracks");
    await peerClient.setRemoteDescription(remoteTracksData.sessionDescription);
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

  return await resolvingTracks;
};

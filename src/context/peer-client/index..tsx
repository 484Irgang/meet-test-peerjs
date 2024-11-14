"use client";

import { useLocalTracksStore } from "@/store/local-stream-tracks";
import { useRemoteStreamTracksStore } from "@/store/remote-stream-tracks";
import { RoomUsers, useRoomStore } from "@/store/room";
import { useUserStore } from "@/store/user";
import { isEmpty, toPairs } from "ramda";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import PeerService, { GenerateSessionPeerResponse } from "./service";

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
  const cleanRemoteTracks = useRemoteStreamTracksStore(
    (state) => state.cleanRemoteTracks
  );

  const handleStartConnection = async () => {
    try {
      const promises = [
        PeerService.generateSessionPeer(),
        getLocalStreamTracks(),
      ];

      const [sessionPeerResponse, localStreamTracks] = (await Promise.all(
        promises
      )) as [GenerateSessionPeerResponse, MediaStreamTrack[]];

      if (!sessionPeerResponse.peer || !sessionPeerResponse.sessionId)
        throw new Error("Error starting peer connection");

      setPeerClient(sessionPeerResponse.peer);
      setSessionId(sessionPeerResponse.sessionId);

      const { success, data } = await PeerService.sendTracksToSession(
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

  const normalizeRemoteUsersTracks = async (
    mySessionId: string,
    remoteUsers: RoomUsers
  ) => {
    try {
      console.log("Normalize remote session tracks", remoteUsers);

      const remoteTracks = useRemoteStreamTracksStore.getState().remoteTracks;

      const { joinedTracks, unjoinedSessions } =
        PeerService.generateTracksToPull(remoteUsers, remoteTracks);

      if (!joinedTracks?.length)
        return handleRemoveRemoteTracks(unjoinedSessions);

      const pulledTracks = await PeerService.pullRemoteUsersTracks({
        mySessionId,
        tracksToPull: joinedTracks,
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

      return handleRemoveRemoteTracks(unjoinedSessions);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveRemoteTracks = (sessionIds: string[]) => {
    if (!sessionIds?.length) return;
    sessionIds.forEach((sessionId) => cleanRemoteTracks(sessionId));
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

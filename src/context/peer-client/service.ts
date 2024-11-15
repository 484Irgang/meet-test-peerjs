import { CallsService } from "@/services/cloudflare_calls";
import { TrackObject } from "@/services/cloudflare_calls/types";
import { RemoteRoomTracks } from "@/store/remote-stream-tracks";
import { RoomUsers } from "@/store/room";
import { PromiseFeedback } from "@/types/responses";

export type GenerateSessionPeerResponse = {
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

// -------------------------------------------------

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
      peer.addTransceiver(track, { direction: "sendonly" })
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

// -------------------------------------------------

type RemoteTracksNormalized = {
  joinedTracks: TrackObject[];
  unjoinedSessions: string[];
};

const normalizeRemoteTracks = (
  remoteUsers: RoomUsers,
  remoteTracks: RemoteRoomTracks
) =>
  Object.values(remoteUsers).reduce<RemoteTracksNormalized>(
    (acc, user) => {
      const remoteTracksStored = user?.sessionId
        ? remoteTracks?.[user.sessionId]
        : [];

      if (
        !remoteTracksStored?.length &&
        !!user?.joined &&
        !!user?.media?.sessionTracks?.length
      ) {
        const tracks: TrackObject[] =
          user?.media?.sessionTracks.map(({ trackName }) => ({
            location: "remote",
            trackName: trackName,
            sessionId: user.sessionId,
          })) ?? [];

        acc.joinedTracks.push(...tracks);
        return acc;
      }

      if (remoteTracksStored?.length && !user?.joined && user?.sessionId) {
        acc.unjoinedSessions.push(user.sessionId);
        return acc;
      }

      return acc;
    },
    { joinedTracks: [], unjoinedSessions: [] }
  );

// -------------------------------------------------

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

const PeerService = {
  generateSessionPeer,
  sendTracksToSession,
  normalizeRemoteTracks,
  pullRemoteUsersTracks,
};

export default PeerService;

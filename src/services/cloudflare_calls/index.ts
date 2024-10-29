import createApiClient from "@/network-clients/http";
import {
  CloseTrackObject,
  CloseTracksRequest,
  CloseTracksResponse,
  GetSessionStateResponse,
  NewSessionResponse,
  SessionDescription,
  TrackObject,
  TracksRequest,
  TracksResponse,
} from "./types";

const callsClient = createApiClient(
  String(process.env.NEXT_PUBLIC_CLOUDFLARE_CALL_API_BASE),
  {
    headers: {
      Authorization: `Bearer ${String(
        process.env.NEXT_PUBLIC_CLOUDFLARE_CALL_API_TOKEN
      )}`,
    },
  }
);

const createCallSession = async () =>
  callsClient<NewSessionResponse>("/sessions/new", { method: "POST" });

const getCallSession = async (sessionId: string) =>
  callsClient<GetSessionStateResponse>(`/sessions/${sessionId}`);

const addLocalTracksToCallSession = async (
  sessionId: string,
  tracks: TrackObject[],
  sdp: RTCSessionDescription
) =>
  callsClient<TracksResponse>(`/sessions/${sessionId}/tracks/new`, {
    method: "POST",
    body: JSON.stringify({
      tracks,
      sessionDescription: {
        sdp: sdp.sdp,
        type: "offer",
      },
    } as TracksRequest),
  });

const getRemoteTracksFromCallSession = async (
  sessionId: string,
  tracks: TrackObject[]
) =>
  callsClient<TracksResponse>(`/sessions/${sessionId}/tracks/new`, {
    method: "POST",
    body: JSON.stringify({
      tracks,
    } as TracksRequest),
  });

const closeTracksFromCallSession = async (
  sessionId: string,
  tracks: CloseTrackObject[],
  sessionDescription: RTCSessionDescription,
  force = false
) =>
  callsClient<CloseTracksResponse>(`sessions/${sessionId}/tracks/close`, {
    method: "PUT",
    body: JSON.stringify({
      tracks,
      sessionDescription: {
        sdp: sessionDescription.sdp,
        type: "offer",
      },
      force,
    } as CloseTracksRequest),
  });

const renegotiateCallSession = async (
  sessionId: string,
  sdp: RTCSessionDescription
) =>
  callsClient<SessionDescription>(`sessions/${sessionId}/renegotiate`, {
    method: "PUT",
    body: JSON.stringify({
      sessionDescription: {
        sdp: sdp.sdp,
        type: "answer",
      },
    }),
  });

export const CallsService = {
  session: {
    createCallSession,
    getCallSession,
    renegotiateCallSession,
  },
  tracks: {
    addLocalTracksToCallSession,
    getRemoteTracksFromCallSession,
    closeTracksFromCallSession,
  },
};

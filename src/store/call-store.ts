import { TrackObject } from "@/services/cloudflare_calls/types";
import { parseCookies } from "nookies";
import { union } from "ramda";
import { create } from "zustand";

export type RemoteSession = {
  id: string;
  tracks: TrackObject[];
};

type CallStore = {
  sessionId: string | null;
  setSessionId: (sessionId: string) => void;
  remoteSessions: RemoteSession[];
  appendRemoteSession: (session: RemoteSession) => void;
  removeRemoteSession: (sessionId: string) => void;
};

export const useCallStore = create<CallStore>((set) => {
  const { ["calls_session_id"]: sessionId } = parseCookies();
  return {
    sessionId: sessionId || null,
    setSessionId: (sessionId) => set({ sessionId }),
    remoteSessions: [],
    appendRemoteSession: (session) =>
      set((state) => ({
        remoteSessions:
          session.id === state.sessionId
            ? state.remoteSessions
            : union(state.remoteSessions, [session]),
      })),
    removeRemoteSession: (sessionId) =>
      set((state) => ({
        remoteSessions: state.remoteSessions.filter(
          (session) => session.id !== sessionId
        ),
      })),
  };
});

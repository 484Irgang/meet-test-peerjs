import { parseCookies } from "nookies";
import { union } from "ramda";
import { create } from "zustand";

type CallStore = {
  sessionId: string | null;
  setSessionId: (sessionId: string) => void;
  remoteSessionIds: string[];
  appendRemoteSessionId: (sessionId: string) => void;
  removeRemoteSessionId: (sessionId: string) => void;
};

export const useCallStore = create<CallStore>((set) => {
  const { ["calls_session_id"]: sessionId } = parseCookies();
  return {
    sessionId: sessionId || null,
    setSessionId: (sessionId) => set({ sessionId }),
    remoteSessionIds: [],
    appendRemoteSessionId: (sessionId) =>
      set((state) => ({
        remoteSessionIds: union(state.remoteSessionIds, [sessionId]),
      })),
    removeRemoteSessionId: (sessionId) =>
      set((state) => ({
        remoteSessionIds: state.remoteSessionIds.filter(
          (id) => id !== sessionId
        ),
      })),
  };
});

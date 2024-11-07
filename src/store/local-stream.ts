import { destroyCookie, parseCookies, setCookie } from "nookies";
import { create } from "zustand";

type LocalStreamStore = {
  stream: MediaStream | null;
  setStream: (stream: MediaStream) => void;
  streamAccessAllowed: boolean;
  setStreamAccessAllowed: (allowed: boolean) => void;
  mutated: boolean;
  toggleMutated: () => void;
  showCamera: boolean;
  toggleCamera: () => void;
};

export const useLocalStreamStore = create<LocalStreamStore>((set) => {
  const { ["@dwv-meet:stream_access_allowed"]: allowed } = parseCookies();

  return {
    stream: null,
    setStream: (stream) => set({ stream }),
    streamAccessAllowed: Boolean(allowed),
    setStreamAccessAllowed: (allowed) => {
      if (!allowed) destroyCookie(null, "@dwv-meet:stream_access_allowed");
      else setCookie(null, "@dwv-meet:stream_access_allowed", String(allowed));
      return set({ streamAccessAllowed: allowed });
    },
    mutated: false,
    toggleMutated: () =>
      set((state) => {
        const newMutated = !state.mutated;
        if (!state.stream) return state;
        state.stream.getAudioTracks().forEach((track) => {
          track.enabled = !newMutated;
        });
        return { mutated: newMutated };
      }),
    showCamera: true,
    toggleCamera: () =>
      set((state) => {
        const newShowCamera = !state.showCamera;
        if (!state.stream) return state;
        state.stream.getVideoTracks().forEach((track) => {
          track.enabled = newShowCamera;
        });
        return { showCamera: newShowCamera };
      }),
  };
});

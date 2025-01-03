import { destroyCookie, parseCookies, setCookie } from "nookies";
import { create } from "zustand";

type LocalTracksStore = {
  audioStreamTracks: MediaStreamTrack[];
  videoStreamTracks: MediaStreamTrack[];
  setStreamTracks: (
    kind: "audio" | "video"
  ) => (audioStreamTracks: MediaStreamTrack[]) => void;
  streamAccessAllowed: boolean;
  setStreamAccessAllowed: (allowed: boolean) => void;
  mutated: boolean;
  toggleMutated: () => void;
  showCamera: boolean;
  toggleCamera: () => void;
  stopTracks: (kind: "audio" | "video" | "all") => void;
};

export const useLocalTracksStore = create<LocalTracksStore>((set) => {
  const { ["@dwv-meet:stream_access_allowed"]: allowed } = parseCookies();

  return {
    audioStreamTracks: [],
    videoStreamTracks: [],
    setStreamTracks: (kind) => (streamTracks) =>
      set((state) => {
        if (kind === "audio") {
          state.audioStreamTracks.forEach((track) => track.stop());
          return { audioStreamTracks: streamTracks };
        }
        if (kind === "video") {
          state.videoStreamTracks.forEach((track) => track.stop());
          return { videoStreamTracks: streamTracks };
        }
        return state;
      }),
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
        if (!state.audioStreamTracks?.length) return state;
        state.audioStreamTracks.forEach((track) => {
          track.enabled = !newMutated;
        });
        return { mutated: newMutated };
      }),
    showCamera: true,
    toggleCamera: () =>
      set((state) => {
        const newShowCamera = !state.showCamera;
        if (!state.videoStreamTracks) return state;
        state.videoStreamTracks.forEach((track) => {
          track.enabled = newShowCamera;
        });
        return { showCamera: newShowCamera };
      }),
    stopTracks: (kind) => {
      if (kind === "audio") {
        set((state) => {
          state.audioStreamTracks.forEach((track) => track.stop());
          return { audioStreamTracks: [] };
        });
      } else if (kind === "video") {
        set((state) => {
          state.videoStreamTracks.forEach((track) => track.stop());
          return { videoStreamTracks: [] };
        });
      } else {
        set((state) => {
          state.audioStreamTracks.forEach((track) => track.stop());
          state.videoStreamTracks.forEach((track) => track.stop());
          return { audioStreamTracks: [], videoStreamTracks: [] };
        });
      }
    },
  };
});

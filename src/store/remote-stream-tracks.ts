import { produce } from "immer";
import { create } from "zustand";

export type RemoteRoomTracks = { [sessionId: string]: MediaStreamTrack[] };

type RemoteStreamTracksStore = {
  remoteTracks: RemoteRoomTracks;
  setRemoteTracks: (sessionId: string, tracks: MediaStreamTrack[]) => void;
  cleanRemoteTracks: (sessionId: string | undefined) => void;
};

export const useRemoteStreamTracksStore = create<RemoteStreamTracksStore>(
  (set) => ({
    remoteTracks: {},
    setRemoteTracks: (sessionId, tracks) =>
      set(
        produce((state) => {
          state.remoteTracks[sessionId] = tracks;
        })
      ),
    cleanRemoteTracks: (sessionId) =>
      set(
        produce((draft) => {
          if (!sessionId) return;
          delete draft.remoteTracks[sessionId];
        })
      ),
  })
);

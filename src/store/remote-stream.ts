import { create } from "zustand";

type RemoteStreamStore = {
  remoteStreams: { [sessionId: string]: MediaStream } | null;
  setRemoteStream: (sessionId: string, remoteStream: MediaStream) => void;
};

export const useRemoteStreamStore = create<RemoteStreamStore>((set) => ({
  remoteStreams: null,
  setRemoteStream: (sessionId, remoteStream) =>
    set((state) => ({
      ...state,
      remoteStreams: {
        ...state.remoteStreams,
        [sessionId]: remoteStream,
      },
    })),
}));

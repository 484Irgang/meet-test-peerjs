import { create } from "zustand";

type RemoteStreamStore = {
  remoteStreams: { [peerId: string]: MediaStream } | null;
  setRemoteStream: (peerId: string, remoteStream: MediaStream) => void;
};

export const useRemoteStreamStore = create<RemoteStreamStore>((set) => ({
  remoteStreams: null,
  setRemoteStream: (peerId, remoteStream) =>
    set((state) => ({
      ...state,
      remoteStreams: {
        ...state.remoteStreams,
        [peerId]: remoteStream,
      },
    })),
}));

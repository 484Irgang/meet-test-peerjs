import { create } from "zustand";

type RemoteStreamStore = {
  remoteStream: MediaStream | null;
  setRemoteStream: (remoteStream: MediaStream) => void;
};

export const useRemoteStreamStore = create<RemoteStreamStore>((set) => ({
  remoteStream: null,
  setRemoteStream: (remoteStream) => set({ remoteStream }),
}));

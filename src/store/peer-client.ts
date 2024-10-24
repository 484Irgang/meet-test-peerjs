import { create } from "zustand";

type PeerClientStore = {
  myPeerId: string | null;
  setMyPeerId: (myPeerId: string) => void;
  remotePeerId: string | null;
  setRemotePeerId: (remotePeerId: string) => void;
};

export const usePeerClientStore = create<PeerClientStore>((set) => ({
  myPeerId: null,
  setMyPeerId: (myPeerId) => set({ myPeerId }),
  remotePeerId: null,
  setRemotePeerId: (remotePeerId) => set({ remotePeerId }),
}));

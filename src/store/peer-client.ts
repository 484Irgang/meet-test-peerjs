import { union } from "ramda";
import { create } from "zustand";

type PeerClientStore = {
  myPeerId: string | null;
  setMyPeerId: (myPeerId: string) => void;
  remotePeers: Array<string>;
  appendRemotePeer: (remotePeerId: string) => void;
  removeRemotePeer: (remotePeerId: string) => void;
};

export const usePeerClientStore = create<PeerClientStore>((set) => ({
  myPeerId: null,
  setMyPeerId: (myPeerId) => set({ myPeerId }),
  remotePeers: [],
  appendRemotePeer: (remotePeerId) =>
    set((state) => ({
      ...state,
      remotePeers: union(state.remotePeers, [remotePeerId]),
    })),
  removeRemotePeer: (remotePeerId) =>
    set((state) => ({
      ...state,
      remotePeers: state.remotePeers.filter(
        (peerId) => peerId !== remotePeerId
      ),
    })),
}));

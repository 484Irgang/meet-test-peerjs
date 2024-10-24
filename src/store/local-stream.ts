import { create } from "zustand";

type LocalStreamStore = {
  stream: MediaStream | null;
  setStream: (stream: MediaStream) => void;
};

export const useLocalStreamStore = create<LocalStreamStore>((set) => ({
  stream: null,
  setStream: (stream) => set({ stream }),
}));

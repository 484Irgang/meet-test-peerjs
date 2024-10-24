import { create } from "zustand";

type UserMediaStore = {
  stream: MediaStream | null;
  setStream: (stream: MediaStream) => void;
};

export const useMediaStore = create<UserMediaStore>((set) => ({
  stream: null,
  setStream: (stream) => set({ stream }),
}));

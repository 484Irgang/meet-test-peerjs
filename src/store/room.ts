import { Room } from "@/types/room";
import { create } from "zustand";

type RoomStore = {
  room: Room | null;
  setRoom: (room: Room) => void;
};

export const useRoomStore = create<RoomStore>((set) => ({
  room: null,
  setRoom: (room) => set({ room }),
}));

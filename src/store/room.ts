import { Room } from "@/types/room";
import { IUser } from "@/types/user";
import { create } from "zustand";

type RoomUsers = { [userId: string]: IUser };

type RoomStore = {
  room: Room | null;
  setRoom: (room: Room) => void;
  roomUsers: RoomUsers | null;
  appendRoomUser: (user: IUser) => void;
  removeRoomUser: (userId: string) => void;
};

export const useRoomStore = create<RoomStore>((set) => ({
  room: null,
  setRoom: (room) => set({ room }),
  roomUsers: null,
  appendRoomUser: (user) =>
    set((state) => ({
      roomUsers: { ...state.roomUsers, [user.id]: user },
    })),
  removeRoomUser: (userId) =>
    set((state) => {
      const newRoomUsers = { ...state.roomUsers };
      delete newRoomUsers[userId];
      return { roomUsers: newRoomUsers };
    }),
}));

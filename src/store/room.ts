import { Room } from "@/types/room";
import { IUser } from "@/types/user";
import { produce } from "immer";
import { create } from "zustand";

export type RoomUsers = { [userId: string]: IUser };

type RoomStore = {
  room: Room | null;
  setRoom: (room: Room) => void;
  roomUsers: RoomUsers | null;
  updateRoomUser: (user: IUser) => void;
  removeRoomUser: (userId: string) => void;
};

export const useRoomStore = create<RoomStore>((set) => ({
  room: null,
  setRoom: (room) => set({ room }),
  roomUsers: null,
  updateRoomUser: (user) =>
    set(
      produce((draft: RoomStore) => {
        if (!draft.roomUsers) draft.roomUsers = {};
        if (!draft.roomUsers[user.id]) draft.roomUsers[user.id] = user;
        else
          draft.roomUsers[user.id] = { ...draft.roomUsers[user.id], ...user };
      })
    ),
  removeRoomUser: (userId) =>
    set(
      produce((state: RoomStore) => {
        delete state?.roomUsers?.[userId];
      })
    ),
}));

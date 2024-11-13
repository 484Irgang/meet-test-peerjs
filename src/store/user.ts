import { IUser } from "@/types/user";
import { parseCookies } from "nookies";
import { create } from "zustand";

type UserStore = {
  user: IUser | null;
  setUser: (user: IUser) => void;
  updateUser: (user: Partial<IUser>) => void;
};

export const useUserStore = create<UserStore>((set) => {
  const { ["@dwv-meet:user"]: user } = parseCookies();
  const userParsed = user ? (JSON.parse(user) as IUser) : null;
  return {
    user: userParsed,
    setUser: (user: IUser) => {
      // setCookie(null, "@dwv-meet:user", JSON.stringify(user));
      return set({ user });
    },
    updateUser: (user: Partial<IUser>) => {
      set((state) => ({
        user: {
          ...state.user,
          ...user,
        } as IUser,
      }));
    },
  };
});

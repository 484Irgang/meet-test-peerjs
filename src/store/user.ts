import { parseCookies, setCookie } from "nookies";
import { v4 } from "uuid";
import { create } from "zustand";

type UserStore = {
  userId: string | null;
};

export const useUserStore = create<UserStore>(() => {
  const { ["user_id"]: userId } = parseCookies();
  if (!userId) {
    const newId = v4();
    setCookie(null, "user_id", newId);
    return {
      userId: newId,
    };
  }
  return {
    userId,
  };
});

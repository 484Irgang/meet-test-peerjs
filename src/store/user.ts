import { v4 } from "uuid";
import { create } from "zustand";

type UserStore = {
  userId: string;
};

export const useUserStore = create<UserStore>(() => {
  const userId = localStorage?.getItem("user_id");
  if (!userId) {
    const newUserId = v4();
    localStorage.setItem("user_id", newUserId);
    return {
      userId: newUserId,
    };
  }
  return {
    userId,
  };
});

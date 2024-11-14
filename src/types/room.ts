import { IUser } from "./user";

export type Room = {
  id: string;
  name: string;
  admin: Pick<IUser, "id" | "name" | "socketId">;
  insertedAt: string;
  users?: IUser[];
};

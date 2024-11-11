import { IUser } from "./user";

export type Room = {
  id: string;
  name: string;
  admin: IUser;
  insertedAt: string;
};

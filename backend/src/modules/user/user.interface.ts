import type { HydratedDocument } from "mongoose";

export type UserRole = "user" | "admin";

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface IUserCreateInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export type UserDocument = HydratedDocument<IUser>;

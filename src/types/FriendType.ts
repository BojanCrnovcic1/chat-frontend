import { User } from "./User";

export interface FriendType {
    userId?: number;
    friendId?: number;
    status?: "pending" | "accepted" | "blocked" | null;
    createdAt?: Date | null;
    user?: User;
    friend?: User;
  }
  
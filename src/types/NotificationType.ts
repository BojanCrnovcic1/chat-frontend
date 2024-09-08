import { FriendType } from "./FriendType";
import { User } from "./User";

export interface NotificationType {
    notificationId?: number;
    userId?: number | null;
    message?: string | null;
    isRead?: boolean | null;
    createdAt?: Date | null;
    user?: User;
    friend?: FriendType;
  }
  
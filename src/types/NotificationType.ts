import { Admin } from "./Admin";
import { AdminMessageType } from "./AdminMessageType";
import { FriendType } from "./FriendType";
import { User } from "./User";

export interface NotificationType {
    notificationId?: number;
    userId?: number | null;
    adminId?: number | null;
    chatRoomId?: number | null;
    messageId?: number | null;
    adminMessageId?: number | null;
    message?: string | null;
    isRead?: boolean | null;
    createdAt?: Date | null;
    user?: User;
    admin?: Admin;
    adminMessage?: AdminMessageType | AdminMessageType[];
    friend?: FriendType;
    friendId?: number;
  }
  
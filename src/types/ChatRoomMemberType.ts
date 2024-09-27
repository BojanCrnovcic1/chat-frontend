import { ChatRoomType } from "./ChatRoomType";
import { User } from "./User";

export interface ChatRoomMemberType {
    chatRoomId?: number;
    userId?: number;
    role?: "member" | "admin" | null;
    joinedAt?: Date | null;
    chatRoom?: ChatRoomType;
    user?: User;
    username?: string;
    profilePicture?: string | null;
    onlineStatus?: boolean | null;
  }
  
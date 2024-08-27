import { ChatRoomType } from "./ChatRoomType";
import { User } from "./User";

export interface BannedUserType {
    chatRoomId?: number;
    userId?: number;
    bannedAt?: Date | null;
    chatRoom?: ChatRoomType;
    user?: User;
}
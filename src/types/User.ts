import { BannedUserType } from "./BannedUserType";
import { ChatRoomMemberType } from "./ChatRoomMemberType";
import { FriendType } from "./FriendType";
import { LikeType } from "./LikeType";
import { MessageType } from "./MessageType";
import { NotificationType } from "./NotificationType";

export interface User {
    userId?: number;
    username?: string;
    email: string;
    passwordHash: string;
    profilePicture?: string | null;
    onlineStatus?: boolean | null;
    createdAt?: Date | null;
    bannedUsers?: BannedUserType[];
    chatRoomMembers?: ChatRoomMemberType[];
    friends?: FriendType[];
    friends2?: FriendType[];
    likes?: LikeType[];
    messages?: MessageType[];
    notifications?: NotificationType[];
    
}
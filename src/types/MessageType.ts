import { ChatRoomType } from "./ChatRoomType";
import { LikeType } from "./LikeType";
import { User } from "./User";

export interface MessageType {
    messageId?: number;
    chatRoomId?: number | null;
    userId?: number | null;
    content?: string | null;
    contentType?: "text" | "image" | "link" | "video" | "audio" | null;
    parentMessageId?: number | null;
    createdAt?: Date | null;
    chatRoom?: ChatRoomType;
    likes?: LikeType[];
    user?: User;
    parentMessage?: MessageType;
    messages?: MessageType[];
  }
  
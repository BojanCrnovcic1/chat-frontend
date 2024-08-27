import { MessageType } from "./MessageType";
import { User } from "./User";

export interface LikeType {
    likeId?: number;
    userId?: number;
    messageId?: number;
    message?: MessageType;
    user?: User;
  }
  
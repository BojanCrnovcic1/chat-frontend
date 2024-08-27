import { BannedUserType } from "./BannedUserType";
import { ChatRoomMemberType } from "./ChatRoomMemberType";
import { MessageType } from "./MessageType";


export interface ChatRoomType {
  chatRoomId?: number;
  name?: string;
  isGroup?: boolean;
  createdAt?: Date;
  bannedUsers?: BannedUserType[];
  chatRoomMembers?: ChatRoomMemberType[];
  messages?: MessageType[];
}

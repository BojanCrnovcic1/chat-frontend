import { User } from "./User";

export interface FriendType {
  friendId: number;                        
  senderId: number;                        
  receiverId: number;                     
  status: "pending" | "accepted" | "rejected" | null;
  createdAt: Date | null;               
  sender?: User;                           
  receiver?: User;                     
}

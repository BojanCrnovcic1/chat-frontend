import { Admin } from "./Admin";
import { NotificationType } from "./NotificationType";
import { User } from "./User";

export interface AdminMessageType {
    adminMessageId?: number;
    adminId?: number;
    userId?: number | null;
    content?: string;
    isGlobal?: boolean | null;
    createdAt?: Date | null;
    admin?: Admin;
    user?: User;
    notifications?: NotificationType[];
}
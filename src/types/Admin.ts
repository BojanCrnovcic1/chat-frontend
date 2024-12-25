import { AdminMessageType } from "./AdminMessageType";
import { NotificationType } from "./NotificationType";

export interface Admin {
    adminId?: number;
    username?: string;
    email?: string;
    password?: string;
    adminMessages?: AdminMessageType[]
    notifications?: NotificationType[];
}
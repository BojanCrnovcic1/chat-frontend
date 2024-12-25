import { User } from "./User";

export interface AccountDeleteRequestType {
    accountDeleteId?: number;
    requestedAt?: Date | null;
    isReviewed?: boolean | null;
    reason?: string | null;
    user?: User;

}
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { ApiConfig } from "../config/ApiConfig";

interface ApiResponse {
    status: string;
    code: number;
    message: string;
}

export const useMarkMessagesAsRead = () => {
    const { token } = useAuth();
    const [reset, setReset] = useState<ApiResponse | null>(null);

    const resetUnreadMessages = async (userId: number, receiverId: number) => {
        try {
            const response = await axios.post<ApiResponse>(`${ApiConfig.API_URL}api/notification/${userId}/mark-messages-as-read/${receiverId}`, {
                userId,
                receiverId
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log('reset-unread-message: ', response.data)

            setReset(response.data);
        } catch (error) {
            console.error('Error resetting unread messages:', error);
            setReset(null);
        }
    };

    return {
        reset,
        resetUnreadMessages
    };
};

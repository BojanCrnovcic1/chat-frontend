import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './notification.scss';
import { NotificationType } from '../../types/NotificationType';
import { ApiConfig } from '../../config/ApiConfig';
import { useAuth } from '../../context/AuthContext';
import RequestModal from '../../modals/notification/RequestModal';
import { useNavigate } from 'react-router-dom';
import { AdminMessageType } from '../../types/AdminMessageType';

interface NotificationProps {
    userId: number;
}

const Notification: React.FC<NotificationProps> = ({ userId }) => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedNotification, setSelectedNotification] = useState<NotificationType | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [adminMessageModalOpen, setAdminMessageModalOpen] = useState<boolean>(false);
    const [adminMessageContent, setAdminMessageContent] = useState<AdminMessageType | null>(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get(ApiConfig.API_URL + `api/notification/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setNotifications(response.data);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [userId, token]);

    const refreshNotifications = async () => {
        try {
            const response = await axios.get(ApiConfig.API_URL + `api/notification/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setNotifications(response.data);
        } catch (error) {
            console.error('Error refreshing notifications:', error);
        }
    };

    const deleteNotification = async (notificationId: number) => {
        try {
            await axios.delete(ApiConfig.API_URL + `api/notification/${notificationId}/remove`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setNotifications(notifications.filter(notification => notification.notificationId !== notificationId));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleNotificationClick = async (notification: NotificationType) => {
        if (notification.adminMessage) {
            if (Array.isArray(notification.adminMessage)) {
                setAdminMessageContent(notification.adminMessage[0]);
            } else {
                setAdminMessageContent(notification.adminMessage);
            }
            setAdminMessageModalOpen(true);
        } else if (notification.chatRoomId) {
            const currentPath = window.location.pathname;
            if (!currentPath.includes(`/room/${notification.chatRoomId}`)) {
                navigate(`/room/${notification.chatRoomId}`);
            }
        } else if (notification.message?.includes('friend request')) {
            setSelectedNotification(notification);
            setIsModalOpen(true);
        }
    
        await markAsRead(notification.notificationId);
        await refreshNotifications();
    };
    
    const markAsRead = async (notificationId?: number) => {
        if (!notificationId) return;
        try {
            await axios.patch(ApiConfig.API_URL + `api/notification/${notificationId}/read`, null, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setNotifications(notifications.map(notification =>
                notification.notificationId === notificationId
                    ? { ...notification, isRead: true }
                    : notification
            ));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const closeAdminMessageModal = () => {
        setAdminMessageModalOpen(false);
        setAdminMessageContent(null);
    };

    const onRequestHandled = () => {
        setNotifications(notifications.filter(notification => notification !== selectedNotification));
        setSelectedNotification(null);
        setIsModalOpen(false);
    };

    return (
        <div className="notification-container">
            {loading ? (
                <p>Loading notifications...</p>
            ) : (
                <ul>
                    {notifications
                        .sort((a, b) => new Date(b.createdAt ?? new Date()).getTime() - new Date(a.createdAt ?? new Date()).getTime())
                        .map(notification => (
                            <li
                                key={notification.notificationId}
                                className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                {notification.message}
                                {notification.adminMessage && <span className="admin-badge">Admin</span>}
                                <button onClick={(e) => { e.stopPropagation(); notification.notificationId && deleteNotification(notification.notificationId); }}>X</button>
                            </li>
                        ))}
                </ul>
            )}
            {adminMessageModalOpen && (
                <div className="admin-message-modal">
                    <div className="admin-message-content">
                        <h2>Admin Message</h2>
                        <p>{adminMessageContent?.content}</p>
                        <button onClick={closeAdminMessageModal} className="close-button">Close</button>
                    </div>
                </div>
            )}
            {selectedNotification && (
                <RequestModal
                    show={isModalOpen}
                    handleClose={() => setIsModalOpen(false)}
                    notification={selectedNotification}
                    onRequestHandled={onRequestHandled}
                />
            )}
        </div>
    );
};

export default Notification;

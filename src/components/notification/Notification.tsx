import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './notification.scss';
import { NotificationType } from '../../types/NotificationType';
import { ApiConfig } from '../../config/ApiConfig';
import { useAuth } from '../../context/AuthContext';
import RequestModal from '../../modals/notification/RequestModal';



interface NotificationProps {
    userId: number;
}

const Notification: React.FC<NotificationProps> = ({ userId }) => {
    const { token } = useAuth();
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedNotification, setSelectedNotification] = useState<NotificationType | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get(ApiConfig.API_URL + `api/notification/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log('Notifications response:', response.data);
                setNotifications(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching notifications:', error);
                setLoading(false);
            }
        };

        fetchNotifications();
        refreshNotifications()
    }, [userId, token]);

    console.log('Notifications:', notifications);

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
    }

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
        console.log('Notification clicked:', notification); 
        if (!notification.isRead && notification.message?.includes('friend request')) {
            await markAsRead(notification.notificationId); 
            setSelectedNotification(notification);
            setIsModalOpen(true);
        } else {
            markAsRead(notification.notificationId);
        }
        await refreshNotifications();
    };

    const markAsRead = async (notificationId?: number) => {
        console.log('markAsRead called with notificationId:', notificationId);
        if (!notificationId) {
            console.error('No notificationId provided'); 
            return;
        }
        try {
            const response = await axios.patch(ApiConfig.API_URL + `api/notification/${notificationId}/read`, null, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('Mark as read response:', response.data);
            setNotifications(notifications.map(notification =>
                notification.notificationId === notificationId
                    ? { ...notification, isRead: true }
                    : notification
            ));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const onRequestHandled = () => {
        
        setNotifications(notifications.filter(notification => notification !== selectedNotification));
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
                            <button onClick={() => notification.notificationId && deleteNotification(notification.notificationId)}>X</button>
                        </li>
                    ))}
                </ul>
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

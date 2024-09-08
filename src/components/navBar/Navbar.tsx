import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faMoon, faBell } from '@fortawesome/free-solid-svg-icons';
import './navBar.scss';
import { ApiConfig } from '../../config/ApiConfig';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [isInteracted, setIsInteracted] = useState<boolean>(false);

    const notificationSound = new Audio('src/assets/sounds/notification.mp3');
    notificationSound.volume = 1;
    notificationSound.muted = false;

    const fetchNotifications = async (userId: number) => {
        try {
            const response = await axios.get(ApiConfig.API_URL + `api/notification/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const notifications = response.data;
            const unreadNotifications = notifications.filter((notification: { isRead: boolean }) => !notification.isRead);

            console.log("Is interacted:", isInteracted);
            console.log("Unread notifications length:", unreadNotifications.length);
            console.log("Unread count:", unreadCount);
            if (isInteracted && unreadNotifications.length > unreadCount) {
                console.log("Trying to play sound...");
                notificationSound.play()
                .then(() => console.log("Sound played successfully"))
                .catch((error) => {
                    console.error("Play sound failed:", error);
                });
            }

            setUnreadCount(unreadNotifications.length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        if (user?.userId) 
        fetchNotifications(user.userId);
        
    }, [user?.userId]);

    useEffect(() => {
        if (unreadCount > 0 && !isInteracted) {
          console.log("New notification! Playing sound...");
          notificationSound.play()
            .then(() => console.log("Sound played successfully"))
            .catch((error) => console.error("Play sound failed:", error));
        }
      }, [unreadCount, isInteracted]);

    useEffect(() => {
        if (user?.userId) {
            fetchLoginUser(user.userId);
        }
    }, [user?.userId]);

    const fetchLoginUser = async (userId: number) => {
        try {
            const response = await axios.get(ApiConfig.API_URL + `api/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching login user:', error);
        }
    };

    const handleInteraction = () => {
        if (!isInteracted) {
            setIsInteracted(true);
        }
    };

    const handleSettings = () => {
        navigate('settings');
    };

    const handleNotificationClick = () => {
        navigate('notifications');
        setIsInteracted(false);
    };

    return (
        <div className='navBar' onClick={handleInteraction}>
            <div className='navBar-left'>
                <h1>App naziv</h1>
                <span>{user?.username}</span>
            </div>
            <div className='navBar-right'>
                <FontAwesomeIcon icon={faMoon} />
                <div className='notification-wrapper' onClick={handleNotificationClick}>
                    <FontAwesomeIcon
                        icon={faBell}
                        className={`faBell ${unreadCount > 0 ? 'new-notification' : ''}`}
                    />
                    {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
                </div>
                <FontAwesomeIcon icon={faGear} onClick={handleSettings} />
            </div>
        </div>
    );
};

export default Navbar;





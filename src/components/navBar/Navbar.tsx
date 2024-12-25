import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faMoon, faBell, faBars, faFireFlameCurved, faWater, IconDefinition, faClover, faSun, faSnowflake } from '@fortawesome/free-solid-svg-icons';
import './navBar.scss';
import { ApiConfig } from '../../config/ApiConfig';
import { useAuth } from '../../context/AuthContext';
import { defaultProfile } from '../../misc/defaultProfile';

interface NavbarProps {
    toggleSidebar: () => void;
}

const themes = ['red', 'green', 'yellow', 'light', 'dark', 'default'] as const;

const themeIcons: Record<'default' | 'dark' | 'red' | 'green' | 'yellow' | 'light', IconDefinition> = {
    default: faWater,
    dark: faMoon,
    red: faFireFlameCurved,
    green: faClover,
    yellow: faSun,
    light: faSnowflake
  };

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [isInteracted, setIsInteracted] = useState<boolean>(false);
    const [currentTheme, setCurrentTheme] = useState<'default' | 'dark' | 'red' | 'green' | 'yellow' | 'light'>('default');

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

    useEffect(() => {
        const savedTheme = (localStorage.getItem('theme') || 'default') as 'default' | 'dark' | 'red' | 'green' | 'yellow' | 'light';
        setCurrentTheme(savedTheme);
        applyTheme(savedTheme);
    }, []);

    const applyTheme = (theme: 'default' | 'dark' | 'red' | 'green' | 'yellow' | 'light') => {
        document.documentElement.className = '';
        import(`../../styles/themes/${theme}.scss`)
          .then(() => {
            document.documentElement.classList.add(theme);
          })
          .catch((error) => console.error('Greška pri učitavanju teme:', error));
      };
    
      const handleThemeChange = () => {
        const currentIndex = themes.indexOf(currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        const nextTheme = themes[nextIndex];
        setCurrentTheme(nextTheme);
        localStorage.setItem('theme', nextTheme);
        applyTheme(nextTheme);
      };
    
      const getNextThemeIcon = () => {
        const currentIndex = themes.indexOf(currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        const nextTheme = themes[nextIndex] as 'default' | 'dark' | 'red' | 'green';
        return themeIcons[nextTheme];
      };

    const fetchLoginUser = async (userId: number) => {
        try {
            const response = await axios.get(ApiConfig.API_URL + `api/user/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
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
                <FontAwesomeIcon icon={faBars} className="menu-icon" onClick={toggleSidebar} />
                <h1>Eee?...</h1>
            </div>
            <div className='navBar-right'>
                <div className='navBar-user'>
                    <img src={user?.profilePicture 
                              ? ApiConfig.PHOTO_PATH + user.profilePicture 
                              : defaultProfile} 
                               alt="Profile" 
                    />
                    <span>{user?.username}</span>
                </div>
                <FontAwesomeIcon icon={getNextThemeIcon()}
                                 onClick={handleThemeChange}
                                 size='2x' />

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





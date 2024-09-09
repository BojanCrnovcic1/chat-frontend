import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './friends.scss';
import { FriendType } from '../../types/FriendType';
import axios from 'axios';
import { ApiConfig } from '../../config/ApiConfig';

const Friends = () => {
    const { token, user } = useAuth();
    const userId = user?.userId;
    const [friends, setFriends] = useState<FriendType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetchFriends();
    }, [userId]);

    const fetchFriends = async () => {
        try {
            const response = await axios.get(ApiConfig.API_URL + `api/friend/${userId}/friends`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setFriends(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching friends.', error);
            setLoading(false);
        }
    };

    if (loading) {
        return <p>Loading friends...</p>;
    }

    return (
        <div className="friends-container">
            <div className="list-friends">
                {friends.length === 0 ? (
                    <p>No friends found.</p>
                ) : (
                    <ul>
                        {friends.map((friend) => (
                            <li key={`${friend.userId}-${friend.friendId}`} className="friend-item">
                                <div className="friend-info">
                                    <img
                                        src={ApiConfig.PHOTO_PATH + friend.friend?.profilePicture}
                                        alt=""
                                        className="friend-profile-picture"
                                    />
                                    <div className="friend-details">
                                        <h3>{friend.friend?.username}</h3>
                                    </div>
                                    <span
                                        className={`status-indicator ${
                                            friend.friend?.onlineStatus ? 'online' : 'offline'
                                        }`}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Friends;

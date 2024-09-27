import { useEffect, useState } from 'react';
import './friends.scss';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FriendType } from '../types/FriendType';
import { ApiConfig } from '../config/ApiConfig';

const Friends = () => {
    const { token, user } = useAuth();
    const userId = user?.userId;
    const navigate = useNavigate();
    const [friends, setFriends] = useState<FriendType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (userId) {
            fetchFriends();
        }
    }, [userId]);

    const handleChatRoom = async (friendId: number) => {
        try {
            const response = await axios.post(
                `${ApiConfig.API_URL}api/room/private`,
                {
                    userId1: userId,
                    userId2: friendId
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const chatRoomId = response.data.chatRoomId;
            navigate(`/room/${chatRoomId}`);
        } catch (error) {
            console.error('Error creating chat room.', error);
        }
    };

    const fetchFriends = async () => {
        try {
            const response = await axios.get(
                `${ApiConfig.API_URL}api/friend/${userId}/friends`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setFriends(response.data);
        } catch (error) {
            console.error('Error fetching friends.', error);
        } finally {
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
                        {friends.map((friend) => {
                            const friendInfo = friend.userId === userId ? friend.friend : friend.user;
                            
                            const profilePicture = friendInfo?.profilePicture
                                ? `${ApiConfig.PHOTO_PATH}${friendInfo.profilePicture}`
                                : '/default-avatar.png'; // default avatar

                            return (
                                <li
                                    key={`${friend.userId}-${friend.friendId}`}
                                    className="friend-item"
                                    onClick={() =>
                                        friendInfo?.userId &&
                                        handleChatRoom(friendInfo?.userId)
                                    }
                                >
                                    <div className="friend-info">
                                        <img
                                            src={profilePicture}
                                            alt="Friend Profile"
                                            className="friend-profile-picture"
                                        />
                                        <div className="friend-details">
                                            <h3>{friendInfo?.username || 'Unknown User'}</h3>
                                        </div>
                                        <span
                                            className={`status-indicator ${
                                                friendInfo?.onlineStatus ? 'online' : 'offline'
                                            }`}
                                        />
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Friends;
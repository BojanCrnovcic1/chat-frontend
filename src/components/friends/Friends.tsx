import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './friends.scss';
import { FriendType } from '../../types/FriendType';
import { ChatRoomType } from '../../types/ChatRoomType';  // Import the ChatRoomType
import axios from 'axios';
import { ApiConfig } from '../../config/ApiConfig';
import { useNavigate } from 'react-router-dom';

const Friends = () => {
    const { token, user } = useAuth();
    const userId = user?.userId;
    const navigate = useNavigate();
    const [friends, setFriends] = useState<FriendType[]>([]);
    const [groupRooms, setGroupRooms] = useState<ChatRoomType[]>([]);  // State for group rooms
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (userId) {
            fetchFriends();
            fetchGroupRooms(); 
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
            console.log('list friends of user: ',response.data)
        } catch (error) {
            console.error('Error fetching friends.', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchGroupRooms = async () => {
        try {
            const response = await axios.get(
                `${ApiConfig.API_URL}api/room/user/groups`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setGroupRooms(response.data);
            console.log('group rooms: ', response.data);
        } catch (error) {
            console.error('Error fetching group rooms.', error);
        }
    };

    const handleGroupRoom = async (chatRoomId: number) => {
        navigate(`/room/${chatRoomId}`);
    };
    

    if (loading) {
        return <p>Loading friends...</p>;
    }

    return (
        <div className="friends-container">
            <div className="list-friends">
                {friends.length === 0 && groupRooms.length === 0 ? (
                    <p>No friends or group rooms found.</p>
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

                        {groupRooms.map((room) => (
                            <li
                                key={room.chatRoomId}
                                className="group-room-item"
                                onClick={() => handleGroupRoom(room.chatRoomId!)}
                            >
                                <div className="group-room-info">
                                    <h3>{room.name || 'Unnamed Group'}</h3>
                                    <span className="group-label">Group</span>
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



import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './friends.scss';
import { FriendType } from '../../types/FriendType';
import { ChatRoomType } from '../../types/ChatRoomType';
import axios from 'axios';
import { ApiConfig } from '../../config/ApiConfig';
import { useNavigate } from 'react-router-dom';
import { defaultProfile } from '../../misc/defaultProfile';

interface FriendsProps {
    onUserSelect: () => void;
  }

const Friends: React.FC<FriendsProps> = ({ onUserSelect }) => {
    const { token, user } = useAuth();
    const userId = user?.userId;
    const navigate = useNavigate();
    const [friends, setFriends] = useState<FriendType[]>([]);
    const [groupRooms, setGroupRooms] = useState<ChatRoomType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [unreadMessages, setUnreadMessages] = useState<{ [key: number]: number }>({});

    useEffect(() => {
        if (userId) {
            fetchFriends();
            fetchGroupRooms(); 
            fetchUnreadMessages();
        }
    }, [userId]);

    const fetchUnreadMessages = async () => {
        try {
            const response = await axios.get(
                `${ApiConfig.API_URL}api/notification/unread/${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            const unreadCounts = response.data.reduce((acc: { [key: number]: number }, item: { senderId: number, count: number }) => {
                acc[item.senderId] = item.count;
                return acc;
            }, {});
            setUnreadMessages(unreadCounts);
        } catch (error) {
            console.error('Error fetching unread messages count.', error);
        }
    };


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
            console.log('room id',  chatRoomId)

            navigate(`/room/${chatRoomId}`);
            onUserSelect();
            
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
        onUserSelect();
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
                            const friendInfo = friend.senderId === userId ? friend.receiver: friend.sender;
                            if (!friendInfo) return null;

                            const profilePicture = friendInfo?.profilePicture
                                ? `${ApiConfig.PHOTO_PATH}${friendInfo.profilePicture}`
                                : defaultProfile; 

                                const unreadCount = unreadMessages[friendInfo.userId!] || 0;

                            return (
                                <li
                                    key={`${friend.receiverId}-${friend.senderId}`}
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
                                    {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
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



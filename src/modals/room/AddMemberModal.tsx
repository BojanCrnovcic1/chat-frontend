import React, { useEffect, useState } from 'react'; 
import './addMemberModal.scss';
import axios from 'axios';
import { ApiConfig } from '../../config/ApiConfig';
import { FriendType } from '../../types/FriendType';
import { useAuth } from '../../context/AuthContext';
import { defaultProfile } from '../../misc/defaultProfile';

interface AddMemberProps {
    show: boolean;
    handleClose: () => void;
    chatRoomId: number;
}

const AddMemberModal: React.FC<AddMemberProps> = ({ show, handleClose, chatRoomId }) => {
    const [friends, setFriends] = useState<FriendType[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { token, user } = useAuth();

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const response = await axios.get(
                    `${ApiConfig.API_URL}api/friend/${user?.userId}/friends`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                setFriends(response.data);
                console.log("Friends data:", response.data); 
            } catch (error) {
                console.error('Failed to fetch friends.', error);
            }
        };

        if (show) {
            fetchFriends();
        }
    }, [show, user?.userId, token]);

    const handleAddMember = async () => {
        if (!selectedUserId) {
            setErrorMessage('Please select a friend to add.');
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        try {
            const response = await axios.post(
                `${ApiConfig.API_URL}api/room/${chatRoomId}/members`,
                {
                    userId: selectedUserId,
                    role: 'member'
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            console.log('response add member: ', response.data);
            if (response.data.status === 'error') {
                setErrorMessage(response.data.message);
            } else {
                handleClose();
            }
        } catch (error) {
            console.error("Failed to add member", error);
            setErrorMessage('Failed to add member. Please try again.');      
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`add-modal ${show ? 'show' : 'hide'}`}>
            <div className='add-modal-content'>
                <span className='close' onClick={handleClose}>X</span>
                <h2>Add a friend to the chat room</h2>
                <div className='add-content'>
                    <div className='add-friend-list'>
                        {friends.length > 0 ? (
                            friends.map((friend) => {
                                const friendInfo = friend.senderId === user?.userId ? friend.receiver : friend.sender;
                                const profilePicture = friendInfo?.profilePicture
                                    ? `${ApiConfig.PHOTO_PATH}${friendInfo.profilePicture}`
                                    : defaultProfile;

                                return (
                                    <div key={friend.friendId} className='friend-item'>
                                        <img 
                                            src={profilePicture} 
                                            alt={`${friendInfo?.username || 'Friend'}'s avatar`} 
                                            className='friend-avatar' 
                                        />
                                        <input
                                            type='radio'
                                            id={`friend-${friend.friendId}`}
                                            name='friend'
                                            value={friendInfo?.userId}
                                            onChange={() => setSelectedUserId(friendInfo?.userId!)}
                                        />
                                        <label htmlFor={`friend-${friend.friendId}`}>
                                            {friendInfo?.username || 'Unknown User'}
                                        </label>
                                    </div>
                                );
                            })
                        ) : (
                            <p>No friends available.</p>
                        )}
                    </div>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                    <button onClick={handleAddMember} disabled={isLoading}>
                        {isLoading ? 'Adding...' : 'Add Member'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddMemberModal;

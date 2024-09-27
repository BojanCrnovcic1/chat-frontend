import React, { useEffect, useState } from 'react';
import './removeMemberModal.scss';
import axios from 'axios';
import { ApiConfig } from '../../config/ApiConfig'; 
import { User } from '../../types/User';
import { useAuth } from '../../context/AuthContext';

interface RemoveMemberProps {
    show: boolean;
    handleClose: () => void;
    chatRoomId: number;
}

const RemoveMemberModal: React.FC<RemoveMemberProps> = ({ show, handleClose, chatRoomId }) => {
    const [members, setMembers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { token } = useAuth();

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await axios.get(ApiConfig.API_URL + `api/room/${chatRoomId}/members`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setMembers(response.data);
                console.log("Members data:", response.data);
            } catch (error) {
                console.error('Failed to fetch members.', error);
            }
        };

        if (show) {
            fetchMembers();
        }
    }, [show]);

    const handleRemoveMember = async () => {
        if (!selectedUserId) {
            setErrorMessage('Please select a member to remove.');
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        try {
            const response = await axios.delete(ApiConfig.API_URL + `api/room/${chatRoomId}/members/${selectedUserId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('response remove member: ', response.data);
            if (response.data.status === 'error') {
                setErrorMessage(response.data.message);
            } else {
                handleClose();
            }
        } catch (error) {
            console.error("Failed to remove member", error);
            setErrorMessage('Failed to remove member. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`modal ${show ? 'show' : 'hide'}`}>
            <div className='modal-content'>
                <span className='close' onClick={handleClose}>X</span>
                <h2>Remove a member from the chat room</h2>
                <div className='content'>
                    <div className='member-list'>
                        {members.length > 0 ? (
                            members.map((member) => (
                                <div key={member.userId} className='member-item'>
                                    <img 
                                        src={ApiConfig.PHOTO_PATH + member.profilePicture || 'default-avatar.png'} 
                                        alt={`${member.username}'s avatar`} 
                                        className='member-avatar' 
                                    />
                                    <input type='radio' id={`member-${member.userId}`}
                                           name='member' value={member.userId}
                                           onChange={() =>member.userId && setSelectedUserId(member.userId)} />
                                    <label htmlFor={`member-${member.userId}`}>
                                         {member.username}
                                    </label>
                                </div>
                            ))
                        ) : (
                            <p>No members found.</p>
                        )}
                    </div>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                    <button onClick={handleRemoveMember} disabled={isLoading}>
                        {isLoading ? 'Removing...' : 'Remove Member'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RemoveMemberModal;

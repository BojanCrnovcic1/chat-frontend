import React from 'react';
import './requestModal.scss';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsDown, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { NotificationType } from '../../types/NotificationType';
import { useAuth } from '../../context/AuthContext';
import { ApiConfig } from '../../config/ApiConfig';

interface RequestModal {
    show: boolean;
    handleClose: () => void;
    notification: NotificationType;
    onRequestHandled: () => void;
}

const RequestModal:React.FC<RequestModal> = ({ show, handleClose, notification, onRequestHandled }) => {
    const { token } = useAuth();

    const handleAcceptRequest =  async () => {

        if (!notification.userId) {
            console.error('Invalid user data in notification');
            return;
        }
        try {
            const response = await axios.post(ApiConfig.API_URL + 'api/friend/accept-request', {
                userId: notification.userId,
                friendId: notification.user?.userId,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            
            console.log('acceptad status: ', response.data);
            console.log('u modalu userId: ', notification.userId);
            console.log(' u modalu friendId: ', notification.friendId)
            onRequestHandled();
        } catch (error) {
            console.error('Error accepting friend request:', error)
        } finally {
            handleClose();
        }
    }

    const handleRejectRequest = async () => {
        try {
           await axios.delete(ApiConfig.API_URL + 'api/friend/reject-request', {
                data: {
                    userId: notification.userId,
                    friendId: notification.friendId,
                }
            })
            onRequestHandled();
        } catch (error) {
            console.error('Error reject friend request:', error)
    
        } finally {
            handleClose();
        }
    }
  return (
    <div className={`modal ${show ? 'show' : 'hide'}`}>
        <div className='modal-content'>
            <span className='close' onClick={handleClose}>X</span>
            <h2>Do you accept the request?</h2>
            <div className='buttons'>
                <div className='accept-button'>
                    <button type='button' onClick={handleAcceptRequest}>
                        <FontAwesomeIcon icon={faThumbsUp} />Yes</button>
                </div>
                <div className='reject-button'>
                    <button type='button' onClick={handleRejectRequest}>
                        <FontAwesomeIcon icon={faThumbsDown} />No</button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default RequestModal;
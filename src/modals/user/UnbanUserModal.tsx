import React from 'react';
import './banUserModal.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from '../../context/AuthContext';
import { faThumbsDown, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { BannedUserType } from '../../types/BannedUserType';
import { ApiConfig } from '../../config/ApiConfig';

interface UnbanUserProps {
    show: boolean;
    handleClose: () => void;
    chatRoomId: number;
    userId: number;
}

const UnbanUserModal: React.FC<UnbanUserProps> = ({ show, handleClose, chatRoomId, userId }) => {
    const { token } = useAuth();

    const handleUserUnban = async () => {
        try {
            await axios.delete<BannedUserType>(ApiConfig.API_URL + `api/user/${chatRoomId}/unban/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            handleClose();
        } catch (error) {
            console.error('Error to unban user. ', error)
        }
    }
  return (
    <div className={`modal ${show ? 'show' : 'hide'}`}>
      <div className='ban-modal-content'>
      <span className='close' onClick={handleClose}>X</span>
      <h2>Are you sure you want to unblock the user?</h2>
      <div className='buttons'>
          <div className='accept-button'>
              <button type='button' onClick={handleUserUnban}>
                  <FontAwesomeIcon icon={faThumbsUp} />Yes</button>
          </div>
          <div className='reject-button'>
              <button type='button' onClick={handleClose}>
                  <FontAwesomeIcon icon={faThumbsDown} />No</button>
          </div>
      </div>
      </div>
    </div>
  )
}

export default UnbanUserModal
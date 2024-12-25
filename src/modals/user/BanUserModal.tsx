import axios from 'axios';
import React from 'react';
import './banUserModal.scss';
import { BannedUserType } from '../../types/BannedUserType';
import { ApiConfig } from '../../config/ApiConfig';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsDown, faThumbsUp } from '@fortawesome/free-solid-svg-icons';

interface BanUserProps {
  show: boolean;
  handleClose: () => void;
  chatRoomId: number;
  userId: number;
}

const BanUserModal: React.FC<BanUserProps> = ({ show, handleClose, chatRoomId, userId}) => {
  const { token } = useAuth();

  const handleUserBan = async () => {
    try {
       await axios.post<BannedUserType>(ApiConfig.API_URL + `api/user/${chatRoomId}/ban/${userId}`, {
       chatRoomId,
       userId,
      }, {
       headers: {
         Authorization: `Bearer ${token}`
       }
      })
      handleClose();
    } catch (error) {
      console.error('Error to ban user.',error)
    }
 };
  return (
    <div className={`modal ${show ? 'show' : 'hide'}`}>
      <div className='ban-modal-content'>
      <span className='close' onClick={handleClose}>X</span>
      <h2>Are you sure you want to block the user?</h2>
      <div className='buttons'>
          <div className='accept-button'>
              <button type='button' onClick={handleUserBan}>
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

export default BanUserModal
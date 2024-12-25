import { faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import './deleteUserModal.scss';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { ApiConfig } from '../../config/ApiConfig';

interface DeleteUserModalProps {
    show: boolean;
    userId: number;
    handleClose: () => void;
}

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({ show, userId, handleClose}) => {
    const { token } = useAuth();

    const handleDeleteUser = async () => {
        try {
            await axios.delete(ApiConfig.API_URL + `api/admin/deletion-requests/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            handleClose();
        } catch (error) {
            console.error('Fail to delete user.', error)
        }
    };
  return (
    <div className={`delete-modal ${show ? 'show' : 'hide'}`}>
        <div className='delete-content'>
            <span className='close' onClick={handleClose}>X</span>
            <h2>Are you going to delete this user?</h2>
            <div className='buttons'>
                <div className='accept-button'>
                    <button type='button' onClick={handleDeleteUser}>
                        <FontAwesomeIcon icon={faThumbsDown} />Yes
                    </button>
                </div>
                <div className='reject-button'>
                    <button type='button' onClick={handleClose}>
                        <FontAwesomeIcon icon={faThumbsDown} />No
                    </button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default DeleteUserModal
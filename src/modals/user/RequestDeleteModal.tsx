import axios from 'axios';
import './requestDeleteModal.scss';
import React, { useState } from 'react';
import { ApiConfig } from '../../config/ApiConfig';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

interface RequestDeleteModalProps {
    show: boolean;
    userId: number;
    handleClose: () => void;
}

const RequestDeleteModal: React.FC<RequestDeleteModalProps> = ({show, userId, handleClose}) => {
    const { token } = useAuth();
    const [reason, setReason] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault();
        try {
             await axios.post(ApiConfig.API_URL + `api/user/request-account-deletion/${userId}`,{
                reason
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            
            handleClose();
        } catch (error) {
            console.error('Error in send delete request. ', error)
        }
    }
  return (
    <div className={`request-delete-modal ${show ? 'show' : 'hide'}`}>
        <div className='request-delete-content'>
            <span className='close' onClick={handleClose}>X</span>
            <h2>We're sorry that you want to delete your account. <br/><br/>
                Please provide a reason for deletion so that the administrators can assist you as soon as possible.</h2>
            <div className='content'>
                <form onSubmit={handleSubmit}>
                    <textarea value={reason} onChange={(e) => setReason(e.target.value)}
                           placeholder='Please provide a reason...' />
                    <button className='delete-button' type='submit'>
                        <FontAwesomeIcon icon={faPaperPlane} /> Send
                    </button>
                </form>
            </div>
        </div>
    </div>
  )
}

export default RequestDeleteModal
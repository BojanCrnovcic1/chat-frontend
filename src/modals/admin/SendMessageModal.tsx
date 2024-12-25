import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './sendMessageModal.scss';
import { ApiConfig } from '../../config/ApiConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

interface SendMessageModalProps {
    show: boolean;
    userId: number;
    handleClose: () => void;
}

const SendMessageModal: React.FC<SendMessageModalProps> = ({ show, userId, handleClose }) => {
    const [content, setContent] = useState<string>("");
    const { token, admin } = useAuth();
    const adminId = admin?.adminId;

    const handleSendMessage = async () => {
        try {
            const response = await axios.post(ApiConfig.API_URL + `api/admin/send-message-to-user/${adminId}/${userId}`, 
                {content},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setContent(response.data);
            handleClose();
        } catch (error) {
            console.error('Error to send admin message', error)
        }
    }
  return (
    <div className={`admin-send-modal ${show ? 'show' : 'hide'}`}>
        <div className='admin-send-content'>
            <span className='close' onClick={handleClose}>X</span>
            <h2>Admin send message </h2>
            <div className='content'>
                <input type="text"  value={content} onChange={(e) => setContent(e.target.value)}
                 placeholder='Typing...'/>
                <button type='button' onClick={handleSendMessage}>
                    <FontAwesomeIcon icon={faPaperPlane} /> Send 
                </button>
            </div>
        </div>
    </div>
  )
}

export default SendMessageModal;
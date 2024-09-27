import React, { useState } from 'react';
import './editMessageModal.scss'
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { ApiConfig } from '../../config/ApiConfig';

interface EditMessageModalProps {
    show: boolean;
    content: string
    messageId: number;
    handleClose: () => void;
}

const EditMessageModal: React.FC<EditMessageModalProps> = ({show, content, messageId, handleClose}) => {
    const { token } = useAuth();
    const [editContent, setEditContent] = useState<string>(content || '')

    const handleEdit = async () => {
        try {
            const response = await axios.patch(ApiConfig.API_URL + `api/message/${messageId}/editMessage`, {
                content: editContent,
                contentType: 'text'
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setEditContent(response.data);
            handleClose();
        } catch (error) {
            console.error('Error editing message. ',error)
        }
    }
  return (
    <div className={`edit-modal ${show ? 'show' : 'hide'}`}>
        <div className='editModal-content'>
            <span className='close' onClick={handleClose}>X</span>
            <h2>Edit Message</h2>
            <div className='content'>
                <label htmlFor='editMessage'>Edit</label>
                <input type='text' id='editMessage' value={editContent} 
                       onChange={(e) => setEditContent(e.target.value)} />
                <button type='button' onClick={handleEdit}> Change</button>
            </div>
        </div>
    </div>
  )
}

export default EditMessageModal
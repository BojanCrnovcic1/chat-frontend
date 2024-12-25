import React, { useState } from 'react';
import './editUserModal.scss';
import { User } from '../../types/User';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { ApiConfig } from '../../config/ApiConfig';

interface EditUserModalProps {
    show: boolean;
    userId: number;
    handleClose: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ show, userId, handleClose }) => {
    const { token } = useAuth();
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            username,
            password
        };

        try {
            await axios.patch<User>(ApiConfig.API_URL + `api/user/${userId}/edit`, data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            handleClose();
        } catch (error) {
            console.error('Error to update user. ', error);
        };
    };

  return (
    <div className={`edit-modal ${show ? 'show' : 'hide'}`}>
        <div className='edit-content'>
            <span className='close' onClick={handleClose}>X</span>
            <h2>Change user data </h2>
            <div className='content'>
                <form onSubmit={handleSubmit}>
                    <label htmlFor='username'>New username: </label>
                    <input type='text' id='username' value={username} 
                           onChange={(e) => setUsername(e.target.value)} />
                    <label htmlFor='password'>New Password: </label>
                    <input type='password' id='password' value={password}
                           onChange={(e) => setPassword(e.target.value)} />
                    <button className='edit-button' type='submit'>Change</button>
                </form>
            </div>
        </div>
    </div>
  )
}

export default EditUserModal
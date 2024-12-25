import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './changeAvatar.scss';
import { ApiConfig } from '../../config/ApiConfig';

interface ChangeAvatarProps {
    show: boolean;
    handleClose: () => void;
}

const ChangeAvatar: React.FC<ChangeAvatarProps> = ({ show, handleClose }) => {
    const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const { token } = useAuth();

    const handleSubmit: React.FormEventHandler = async (event) => {
        event.preventDefault();

        if (!profilePhoto) {
            console.error('Please select an image');
            return;
        };

        const formData = new FormData();
        formData.append('profilePhoto', profilePhoto);

        try {
            const response = await axios.post(ApiConfig.API_URL + 'api/user/upload-profilePicture', formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            setProfilePhoto(response.data);
            handleClose();
        } catch (error) {
            console.error('Error to upload avatar. ',error);
        };
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files?.[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result && event.target.files?.[0]) {
              setProfilePhoto(event.target.files[0]);
              setPreviewImage(e.target.result as string);
                }
            };
            reader.readAsDataURL(event.target.files[0]);
          }
    }

  return (
    <div className={`modal ${show ? 'show' : 'hide'}`}>
        <div className='avatar-content'>
            <span className='close' onClick={handleClose}>X</span>
            <h2>Change Avatar: </h2>
            <div className='content'>
                <form onSubmit={handleSubmit}>
                    <label htmlFor='profilePhoto'>Select image: </label>
                    <input type='file' id='profilePhoto' onChange={handleImageChange} />
                    {previewImage && <img src={previewImage} alt="Selected Image Preview" />}
                    <button className='avatar-button' type='submit'>Change Avatar</button>
                </form>
            </div>
        </div>
    </div>
  )
}

export default ChangeAvatar
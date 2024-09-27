import React, { useState } from 'react';
import './groupRoomModal.scss';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { ApiConfig } from '../../config/ApiConfig';

interface CreateGroupRoomProps {
    show: boolean;
    handleClose: () => void;
}

const CreateGroupRoomModal: React.FC<CreateGroupRoomProps> = ({ show, handleClose}) => {
    const { token } = useAuth();
    const [nameRoom, setNameRoom] = useState<string>("");

    const handleNewRoom = async () => {
        try {
            const response = await axios.post(ApiConfig.API_URL + 'api/room/createRoom', {
                name: nameRoom,
                isGroup: true
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            setNameRoom(response.data);
            handleClose();
        } catch (error) {
            console.error('Error to create room. ', error)
        }
    }
  return (
    <div className={`create-modal ${show ? 'show' : 'hide'}`}>
        <div className='create-modal-content'>
            <span className='close' onClick={handleClose}>X</span>
            <h2>Create group chat room</h2>
            <div className='content'>
               <input
                 type="text"
                 placeholder="Enter room name"
                 value={nameRoom}
                 onChange={(e) => setNameRoom(e.target.value)}
                />
                <button onClick={handleNewRoom}>Create Room</button>
            </div>
        </div>
    </div>
  )
}

export default CreateGroupRoomModal;
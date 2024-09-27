import React, { useEffect } from 'react';
import './membersListModal.scss';
import { ChatRoomMemberType } from '../../types/ChatRoomMemberType';
import { ApiConfig } from '../../config/ApiConfig';

interface MembersListModalProps {
  show: boolean;
  handleClose: () => void;
  chatRoomMembers: ChatRoomMemberType[];
  handleChatRoomMambers: () => void;
}

const MembersListModal: React.FC<MembersListModalProps> = ({ show, handleClose, chatRoomMembers, handleChatRoomMambers }) => {

    useEffect(() => {
        if (show) {
          handleChatRoomMambers();
        }
    }, [show]);
    
  if (!show) {
    return null;
  }

  return (
    <div className={`modal-members ${show ? 'show' : 'hide'}`}>
      <div className='modalMembers-content'>
        <span className='close' onClick={handleClose}>X</span>
        <h2>Members List</h2>
        <div className='content'>
            <div className='members-list'>
                {chatRoomMembers.length > 0 ? (
                    chatRoomMembers.map((member) => {
                        return (
                            <ul key={member.userId}>
                                <li>
                                    <img src={ApiConfig.PHOTO_PATH + member.profilePicture} alt="Profile" />
                                    <h3>{member.username}</h3>
                                    <span
                                        className={`status-indicator ${member.onlineStatus ? 'online' : 'offline'}`}
                                    />
                                </li>
                            </ul>
                        );
                    })
                ) : (
                    <p>No members found.</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default MembersListModal;


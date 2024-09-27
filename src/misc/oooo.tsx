import React, { useEffect, useRef, useState } from 'react';
import './room.scss';
import { ChatRoomType } from '../../types/ChatRoomType';
import axios from 'axios';
import { ApiConfig } from '../../config/ApiConfig';
import { ChatRoomMemberType } from '../../types/ChatRoomMemberType';
import { useAuth } from '../../context/AuthContext';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faPaperPlane, faUserMinus, faUserPlus, faUserSlash, faUsers, faVideo, faEdit, faTrash, faImage, faSmile } from '@fortawesome/free-solid-svg-icons'; // Dodato faEdit, faTrash
import AddMemberModal from '../../modals/room/AddMemberModal';
import RemoveMemberModal from '../../modals/room/RemoveMemberModal';
import BanUserModal from '../../modals/user/BanUserModal';
import MembersListModal from '../../modals/room/MembersListModal';
import { MessageType } from '../../types/MessageType';
import dayjs from 'dayjs';
import FullscreenImageModal from '../../modals/message/FullsreenImageModal';
import Picker from 'emoji-picker-react';
import EditMessageModal from '../../modals/message/EditMessageModal';

const Room: React.FC = () => {
  const [room, setRoom] = useState<ChatRoomType | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [showAddMemberModal, setShowAddMemberModal] = useState<boolean>(false);
  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState<boolean>(false);
  const [showBanUserModal, setShowBanUserModal] = useState<boolean>(false);
  const [showMembersListModal, setShowMembersListModal] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState<boolean>(false);
  const [editMessageModal, setEditMessageModal] = useState<boolean>(false);
  const [currentImage, setCurrentImage] = useState<string>('');
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const { token, user } = useAuth();
  const userId = user?.userId;
  const { id: chatRoomId } = useParams<{ id: string }>();
  const roomId = Number(chatRoomId);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchRoomData();
    fetchMessages();
  }, [roomId]);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]); 

  const fetchRoomData = async () => {
    try {
      const response = await axios<ChatRoomType>(ApiConfig.API_URL + `api/room/${roomId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setRoom(response.data);
    } catch (error) {
      console.error('Error fetching room details', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get<MessageType[]>(ApiConfig.API_URL + `api/message/${roomId}/rooms`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        content: newMessage,
        chatRoomId: roomId,
        userId: user?.userId,
        contentType: 'text',
      };
      const response = await axios.post<MessageType>(ApiConfig.API_URL + 'api/message/create', messageData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message', error);
    }
  };

  const handleMediaMessage = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('chatRoomId', roomId.toString());
    formData.append('userId', user?.userId?.toString() || '');
    formData.append('contentType', selectedFile.type.split('/')[0]);
    formData.append('file', selectedFile);

    try {
      const response = await axios.post<MessageType>(ApiConfig.API_URL + 'api/message/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      })
      setMessages([...messages, response.data]);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error sending media message', error);
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      console.log('Selected file:', file);
      setSelectedFile(file);
    }
  };

  const handleEditModal = () => {
    setEditMessageModal(false);
  }

  const handleDeleteMessage = async (messageId: number) => {
    try {
      await axios.delete(ApiConfig.API_URL + `api/message/${messageId}/deleteMessage`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessages(messages.filter((msg) => msg.messageId !== messageId));
    } catch (error) {
      console.error('Error deleting message', error);
    }
  };

  const handleUserBan = (userId: number) => {
    // Logika za banovanje korisnika
  };

  const getPrivateChatName = () => {
    if (room?.chatRoomMembers && room.chatRoomMembers.length === 2) {
      const otherUser = room.chatRoomMembers.find(
        (member: ChatRoomMemberType) => member.userId !== user?.userId
      );
      return otherUser?.user?.username || 'Unknown';
    }
    return 'Private Chat';
  };

  const handleImageClick = (imageUrl: string) => {
    setCurrentImage(imageUrl);
    setImageModalOpen(true);
  };

  const handleEmojiClick = (event: any, emojiObject: any) => {
    setNewMessage(prevInput => prevInput + emojiObject.emoji);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  return (
    <div className='room'>
      <div className='room-header'>
        <h2>{room?.isGroup ? room.name : getPrivateChatName()}</h2>
        <div className='room-options'>
          {room?.isGroup ? (
            <>
              <button onClick={() => setShowAddMemberModal(true)}>
                <FontAwesomeIcon icon={faUserPlus} /> Add
              </button>
              <button onClick={() => setShowRemoveMemberModal(true)}>
                <FontAwesomeIcon icon={faUserMinus} /> Remove
              </button>
              <button onClick={() => setShowMembersListModal(true)}>
                <FontAwesomeIcon icon={faUsers} /> Members
              </button>
            </>
          ) : (
            <button onClick={() => setShowBanUserModal(true)}>
              <FontAwesomeIcon icon={faUserSlash} /> Ban User
            </button>
          )}
        </div>
      </div>
      <div className='message-content'>
      <div className='message-list'>
          {messages.map((message) => (
            <div
              key={message.messageId}
              className={`message-items ${message.userId === userId ? 'sent' : 'received'}`}
            >
              <div className='message-info'>
                <strong>{message.user?.username}</strong>
                <span className='message-date'>
                  {dayjs(message.createdAt).format('DD.MM.YYYY HH:mm')}
                </span>
                {message.userId === userId && (
                <div className='message-actions'>
                  <FontAwesomeIcon icon={faEdit} onClick={() => setEditMessageModal(true)} />
                  { editMessageModal && message.messageId !== undefined && (
                   <EditMessageModal show={editMessageModal} content={message.content || ''} messageId={message.messageId} handleClose={handleEditModal} />
                  )}
                  <FontAwesomeIcon icon={faTrash} onClick={() => message.messageId && handleDeleteMessage(message.messageId)} />
                </div>
              )}
              </div>
              <div className='message-text'>
                {message.contentType === 'text' && <p>{message.content}</p>}
                {message.contentType === 'image' && (
                  <img
                  src={`${ApiConfig.PHOTO_PATH}${message.content}`}
                  alt="Shared"
                  onClick={() => handleImageClick(`${ApiConfig.PHOTO_PATH}${message.content}`)}
                />
                )}
                {message.contentType === 'video' && (
                  <video controls>
                  <source src={`${ApiConfig.VIDEO_PATH}${message.content}`} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                )}
                {message.contentType === 'audio' && (
                  <audio controls>
                  <source src={`${ApiConfig.AUDIO_PATH}${message.content}`} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
                )}
              </div>
              
              {imageModalOpen && (
                 <FullscreenImageModal
                  isOpen={imageModalOpen}
                  imageUrl={currentImage}
                  onClose={() => setImageModalOpen(false)}
                  />
              )}
            </div>
          ))}
           <div ref={endRef} />
        </div>
        <div className='message-inputs'>
          <div className='message-input'>
            <input
              type='text'
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder='Type your message...'
            />
            <button onClick={handleSendMessage}>
              <FontAwesomeIcon icon={faPaperPlane} /> Send
            </button>
          </div>
          <div className='message-icons'>
             <label htmlFor="image-upload" title="Upload Image">
                <FontAwesomeIcon icon={faImage} title="Upload Image" />
             </label>
             <input
                type="file"
                id="image-upload"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
                />
              <label htmlFor="video-upload" title="Upload Video">
                 <FontAwesomeIcon icon={faVideo} title="Upload Video" />
              </label>
              <input
                type="file"
                id="video-upload"
                accept="video/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <label htmlFor="audio-upload" title="Upload Audio">
                 <FontAwesomeIcon icon={faMicrophone} title="Upload Audio" />
              </label>
              <input
                type="file"
                id="audio-upload"
                accept="audio/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <FontAwesomeIcon
                  icon={faSmile}
                  className="action-icon"
                  title="Emoji"
                  onClick={toggleEmojiPicker}
              />
              {showEmojiPicker && (
                 <div className="emoji-picker">
                    <Picker onEmojiClick={handleEmojiClick} />
                 </div>
              )}
          </div>
          {selectedFile && (
             <button onClick={handleMediaMessage} className="confirm-upload-btn">
                 Upload
             </button>
          )}
        </div>

        {room?.isGroup && showAddMemberModal && (
          <AddMemberModal
            show={showAddMemberModal}
            handleClose={() => setShowAddMemberModal(false)}
            chatRoomId={roomId}
          />
        )}
        {room?.isGroup && showRemoveMemberModal && (
          <RemoveMemberModal
            show={showRemoveMemberModal}
            handleClose={() => setShowRemoveMemberModal(false)}
            chatRoomId={roomId}
          />
        )}
        {room?.isGroup && showMembersListModal && (
          <MembersListModal
            show={showMembersListModal}
            handleClose={() => setShowMembersListModal(false)}
            chatRoomMembers={room?.chatRoomMembers || []}
          />
        )}
        {!room?.isGroup && showBanUserModal && (
          <BanUserModal
            roomId={roomId}
            onClose={() => setShowBanUserModal(false)}
            handleBanUser={handleUserBan}
          />
        )}
      </div>
    </div>
  );
};

export default Room;

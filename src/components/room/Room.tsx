import React, { useEffect, useRef, useState } from 'react';
import './room.scss';
import { ChatRoomType } from '../../types/ChatRoomType';
import axios from 'axios';
import { ApiConfig } from '../../config/ApiConfig';
import { ChatRoomMemberType } from '../../types/ChatRoomMemberType';
import { useAuth } from '../../context/AuthContext';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faPaperPlane, faUserMinus, faUserPlus, faUserSlash, faUsers, faVideo, faEdit, faTrash, faImage, faSmile, faReply, faHeart, faUserCheck } from '@fortawesome/free-solid-svg-icons'; // Dodato faEdit, faTrash
import AddMemberModal from '../../modals/room/AddMemberModal';
import RemoveMemberModal from '../../modals/room/RemoveMemberModal';
import BanUserModal from '../../modals/user/BanUserModal';
import MembersListModal from '../../modals/room/MembersListModal';
import { MessageType } from '../../types/MessageType';
import dayjs from 'dayjs';
import FullscreenImageModal from '../../modals/message/FullsreenImageModal';
import Picker from 'emoji-picker-react';
import EditMessageModal from '../../modals/message/EditMessageModal';
import { useLike } from '../../hooks/useLike';
import UnbanUserModal from '../../modals/user/UnbanUserModal';
import { defaultProfile } from '../../misc/defaultProfile';
import { formatDistanceToNow } from 'date-fns';

const Room: React.FC = () => {
  const [room, setRoom] = useState<ChatRoomType | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [chatRoomMembers, setChatRoomMembers] = useState<ChatRoomMemberType[]>([]);
  const [showAddMemberModal, setShowAddMemberModal] = useState<boolean>(false);
  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState<boolean>(false);
  const [showBanUserModal, setShowBanUserModal] = useState<boolean>(false);
  const [showUnbanUserModal, setShowUnbanUserModal] = useState<boolean>(false);
  const [showMembersListModal, setShowMembersListModal] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState<boolean>(false);
  const [editMessageModal, setEditMessageModal] = useState<boolean>(false);
  const [currentImage, setCurrentImage] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [replyToMessageId, setReplyToMessageId] = useState<number | null>(null);
  const [parentMessages, setParentMessages] = useState<{ [key: number]: MessageType }>({});
  const { token, user } = useAuth();
  const userId = user?.userId;
  const { id: chatRoomId } = useParams<{ id: string }>();
  const { like, addLike, removeLike, fetchLikeCount } = useLike();
  const roomId = Number(chatRoomId);
  const endRef = useRef<HTMLDivElement | null>(null);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);


  useEffect(() => {
    fetchRoomData();
    fetchMessages();
  }, [roomId, messages]);

  useEffect(() => {
    if (messages.length > 0) {
      messages.forEach(message => {
        if (message.messageId) {
           fetchLikeCount(message.messageId);
        }
      });
    }
  }, []);

  useEffect(() => {
    const fetchParentMessages = async () => {
      const parentMessageIds = messages
        .filter((message) => message.parentMessageId)
        .map((message) => message.parentMessageId);
  
      const uniqueParentMessageIds = [...new Set(parentMessageIds)];
  
      const fetchedMessages = await Promise.all(
        uniqueParentMessageIds.map(async (id) => {
          const response = await axios.get(ApiConfig.API_URL + `api/message/${id}`, {
            headers: { Authorization: `Bearer ${token}`}
          }); 
          return { id, message: response.data };
        })
      );
  
      const parentMessageMap = fetchedMessages.reduce((acc, { id, message }) => {
        acc[id as number] = message;
        return acc;
      }, {} as Record<number, any>); 
  
      setParentMessages(parentMessageMap);
    };
  
    if (messages.some((msg) => msg.parentMessageId)) {
      fetchParentMessages();
    }
  }, [messages]);
  

  useEffect(() => {
    if (autoScrollEnabled && endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScrollEnabled]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (scrollHeight - scrollTop > clientHeight + 50) {
      setAutoScrollEnabled(false);
    } else {
      setAutoScrollEnabled(true);
    }
  };
  
  
  const fetchRoomData = async () => {
    try {
      const response = await axios<ChatRoomType>(ApiConfig.API_URL + `api/room/${roomId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setRoom(response.data);
      console.log('fetch room data: ', response)
    } catch (error) {
      console.error('Error fetching room details', error);
    }
  };

  const handleChatRoomMambers = async () => {
    try {
        const response = await axios.get<ChatRoomMemberType[]>(ApiConfig.API_URL + `api/room/${roomId}/members`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        setChatRoomMembers(response.data);
    } catch (error) {
        console.error('Error fetch chat members. ',error)
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

    const isBanned = room?.bannedUsers?.some((bannedUser) => bannedUser.userId === user?.userId);
    
    if (isBanned) {
        alert('You are banned from this chat room and cannot send messages.');
        return;
    }

    if (!newMessage.trim()) return;

    try {
      const messageData = {
        content: newMessage,
        chatRoomId: roomId,
        userId: user?.userId,
        contentType: 'text',
        parentMessageId: replyToMessageId,
      };
      const response = await axios.post<MessageType>(ApiConfig.API_URL + 'api/message/create', messageData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMessages([...messages, response.data]);
      setNewMessage('');
      setReplyToMessageId(null);
    } catch (error) {
      console.error('Error sending message', error);
    }
  };

  const handleMediaMessage = async () => {

    const isBanned = room?.bannedUsers?.some((bannedUser) => bannedUser.userId === user?.userId);
    
    if (isBanned) {
        alert('You are banned from this chat room and cannot send messages.');
        return;
    }

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

  const handleReply = (messageId: number) => {
    setReplyToMessageId(messageId);
  };

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

  const urlRegex = /^(https?:\/\/[^\s]+)$/;
  const isUrl = (content: string) => urlRegex.test(content);

  const getPrivateChatName = () => {
    
    if (room?.chatRoomMembers && room.chatRoomMembers.length === 2) {
        const otherUser = room.chatRoomMembers.find(
            (member: ChatRoomMemberType) => member.userId !== user?.userId
        );

        return (
          <>
          <div className='room-header-detalis'>
              <div className="private-detalis">
                  <img src={otherUser?.user?.profilePicture ? ApiConfig.PHOTO_PATH + otherUser?.user?.profilePicture : defaultProfile} alt={`${otherUser?.user?.username}'s profile`} className="profile-picture" 
                             onClick={() => openProfileImageModal(otherUser?.user?.profilePicture ? ApiConfig.PHOTO_PATH + otherUser?.user?.profilePicture : defaultProfile)} />
                  <div className="user-info">
                      <p className="username">{otherUser?.user?.username}</p>
                      <div className={`status ${otherUser?.user?.onlineStatus ? 'online' : ''}`}>
                          <span className="status-indicator"></span>
                          <p>{otherUser?.user?.onlineStatus ? 'Online' : 
                            <>{otherUser?.user?.lastActive
                              ? formatDistanceToNow(new Date(otherUser.user.lastActive), {
                                  addSuffix: true,
                                })
                              : 'N/A'}</>}</p>
                      </div>
                  </div>
                  {selectedImage && (
                     <div className='modalProfile' onClick={closeProfileImageModal}>
                     <span className='close'>&times;</span>
                     <img className='modalProfile-content' src={selectedImage} alt="Profile" />
                    </div>
                  )}
              </div>
          </div>
          </>
        )
      }
  };

  const handleImageClick = (imageUrl: string) => {
    setCurrentImage(imageUrl);
    setImageModalOpen(true);
  };

  const handleEmojiClick = (emojiObject: any) => {
    setNewMessage(prevMessage => prevMessage + emojiObject.emoji);
    setShowEmojiPicker(false);
  };  

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const openProfileImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
}

const closeProfileImageModal = () => {
    setSelectedImage(null);
}

  const otherUser = room?.chatRoomMembers?.find(
    (member: ChatRoomMemberType) => member.userId !== user?.userId
  );
  const otherUserId = otherUser ? otherUser.userId : undefined;

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
            <>
            {room?.bannedUsers?.some((member) => member.userId !== user?.userId) ? (
              <button onClick={() => setShowUnbanUserModal(true)}>
                <FontAwesomeIcon icon={faUserCheck} /> Unban User
              </button>
            ): (
              <button onClick={() => setShowBanUserModal(true)}>
              <FontAwesomeIcon icon={faUserSlash} /> Ban User
            </button>
            )}
            </>          
          )}
        </div>
      </div>
      <div className='message-content'>
      <div className='message-list' onScroll={handleScroll}>
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
                 {editMessageModal && message.messageId !== undefined && (
                  <EditMessageModal show={editMessageModal} content={message.content || ''} messageId={message.messageId} handleClose={handleEditModal} />
                 )}
              <FontAwesomeIcon icon={faTrash} onClick={() => message.messageId && handleDeleteMessage(message.messageId)} />
              
              </div>
             )}
             <div className='message-like'>
             <FontAwesomeIcon
                              icon={faHeart}
                              onClick={() =>
                              like && like.messageId === message.messageId
                              ? message.messageId && userId && removeLike(message.messageId)
                              : message.messageId && userId && addLike(message.messageId, userId)}
                               style={{
                                color: like && like.messageId === message.messageId ? 'red' : 'inherit',
                                cursor: 'pointer', 
                                transition: 'color 0.3s ease'
                            }}
                               
              />
              {message.likes?.length}
             </div>
             <div className='fa-replay'>
                <FontAwesomeIcon icon={faReply} onClick={() => message.messageId && handleReply(message.messageId)} />
             </div>         
         </div>
         {message.parentMessageId && parentMessages[message.parentMessageId as number] && (
            <div className='reply-message'>
               <div className='reply-header'>
               <strong>{parentMessages[message.parentMessageId as number].user?.username}</strong> replied:
            </div>
            <div className='reply-content'>
               {parentMessages[message.parentMessageId as number].contentType === 'text' && <p>{parentMessages[message.parentMessageId as number].content}</p>}
               {parentMessages[message.parentMessageId as number].contentType === 'image' && (
              <img
                src={`${ApiConfig.PHOTO_PATH}${parentMessages[message.parentMessageId as number].content}`}
                alt="Shared"
              />
            )}
          </div>
            </div>
          )}
      <div className='message-text'>      
         {message.contentType === 'text' && (
           isUrl(message.content ?? '') ? (
               <a 
                   href={message.content as string} 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="chat-link"
               >
                   {message.content} 🔗
               </a>
           ) : (
               <p>{message.content}</p>
           )
        )}
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
      
      {replyToMessageId && (
        <div className='reply-preview'>
          <span>{message.content}</span>
          <button onClick={() => setReplyToMessageId(null)}>Cancel</button>
        </div>
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
                <FontAwesomeIcon icon={faImage} title="Upload Image" />.
             </label>
             <input
                type="file"
                id="image-upload"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
                />
              <label htmlFor="video-upload" title="Upload Video">
                 <FontAwesomeIcon icon={faVideo} title="Upload Video" />.
              </label>
              <input
                type="file"
                id="video-upload"
                accept="video/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <label htmlFor="audio-upload" title="Upload Audio">
                 <FontAwesomeIcon icon={faMicrophone} title="Upload Audio" />.
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
            chatRoomMembers={chatRoomMembers || []}
            handleChatRoomMambers={handleChatRoomMambers}
          />
        )}
        {!room?.isGroup && showBanUserModal && otherUserId !== undefined &&(
          <BanUserModal
            show={showBanUserModal}
            chatRoomId={roomId}
            userId={otherUserId}
            handleClose={() => setShowBanUserModal(false)}
          />
        )}
        {!room?.isGroup && showUnbanUserModal && otherUserId !== undefined &&(
          <UnbanUserModal
            show={showUnbanUserModal}
            chatRoomId={roomId}
            userId={otherUserId}
            handleClose={() => setShowUnbanUserModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Room;

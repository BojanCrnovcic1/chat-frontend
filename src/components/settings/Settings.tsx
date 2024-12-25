import { useState } from 'react';
import './settings.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faUserPen } from '@fortawesome/free-solid-svg-icons';
import ChangeAvatar from '../../modals/user/ChangeAvatar';
import EditUserModal from '../../modals/user/EditUserModal';
import { useAuth } from '../../context/AuthContext';
import { faDeleteLeft } from '@fortawesome/free-solid-svg-icons/faDeleteLeft';
import RequestDeleteModal from '../../modals/user/RequestDeleteModal';

const Settings = () => {
  const [showAvatarModal, setShowAvatarModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const { user, logout } = useAuth();
  const userId = user?.userId;

  const handleLogout = () => {
    logout();
  }

  const handleAvatarModal = () => {
    setShowAvatarModal(false);
  };

  const handleEditModal = () => {
    setShowEditModal(false);
  }

  const handleDeleteModal = () => {
    setShowDeleteModal(false);
  }
  return (
    <div className='settings'>
      <div className='settings-container'>
        <h1>Settings:</h1>
        <div className='button-settings'>
          <button onClick={() => setShowAvatarModal(true)}>
            <FontAwesomeIcon icon={faImage} /> Change avatar</button>
          <button onClick={() => setShowEditModal(true)}>
            <FontAwesomeIcon icon={faUserPen} /> Edit account</button>
          {showAvatarModal && (
            <ChangeAvatar show={showAvatarModal} handleClose={handleAvatarModal} />
          )}
          {showEditModal && user?.userId && userId && (
            <EditUserModal show={showEditModal} userId={userId} handleClose={handleEditModal} />
          )}
        </div>
        <div className='button-logout'>
          <button type='button' onClick={handleLogout}>logout</button>
        </div>
        <div className='button-delete'>
          <button onClick={() => setShowDeleteModal(true)}>
            <FontAwesomeIcon icon={faDeleteLeft} /> Delete account</button>
          {showDeleteModal && user?.userId && userId && (
            <RequestDeleteModal show={showDeleteModal} userId={userId} handleClose={handleDeleteModal} />
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings;
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Friends from '../friends/Friends';
import Search from '../search/Search';
import './sideBar.scss';
import React, { useState } from 'react';
import { faUserGroup } from '@fortawesome/free-solid-svg-icons';
import CreateGroupRoomModal from '../../modals/room/CreateGroupRoomModal';

interface  sidebarProps {
  isSidebarVisible: boolean;
  setSidebarVisible: (visible: boolean) => void;
}

const Sidebar: React.FC<sidebarProps> = ({ isSidebarVisible, setSidebarVisible }) => {
  const [showCreateGroupRoomModal, setShowCreateGroupRoomModal] = useState<boolean>(false);

  const handleCloseSidebar = () => {
    if (window.innerWidth <= 768) {
      setSidebarVisible(false);
    }
  };
  
  return (
    <div className={isSidebarVisible ? 'sideBar visible' : 'sideBar'} >
        <div className='sideBar-search'>
            <Search />
        </div>
        <div className='sideBar-group'>
          <button type='button' onClick={() => setShowCreateGroupRoomModal(true)}>
            <FontAwesomeIcon icon={faUserGroup} /> Create group room
          </button>
          {showCreateGroupRoomModal && (
            <CreateGroupRoomModal show={showCreateGroupRoomModal} handleClose={() => setShowCreateGroupRoomModal(false)} />
          )}
        </div>
        <div className='sideBar-friends'>
            <Friends onUserSelect={handleCloseSidebar} />
        </div>
    </div>
  )
}

export default Sidebar;
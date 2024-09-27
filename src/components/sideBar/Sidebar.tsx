import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Friends from '../friends/Friends';
import Search from '../search/Search';
import './sideBar.scss';
import { useState } from 'react';
import { faUserGroup } from '@fortawesome/free-solid-svg-icons';
import CreateGroupRoomModal from '../../modals/room/CreateGroupRoomModal';

const Sidebar = () => {
  const [showCreateGroupRoomModal, setShowCreateGroupRoomModal] = useState<boolean>(false);
  return (
    <div className='sideBar'>
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
            <Friends />
        </div>
    </div>
  )
}

export default Sidebar;
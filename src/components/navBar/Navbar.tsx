import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './navBar.scss';
import { faGear, faMoon, faPersonRifle } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import React from 'react';

interface NavBarProps {
    userId: string;
}

const Navbar: React.FC<NavBarProps> = ({ userId }) => {
    const navigate = useNavigate();

    const handleProfile = () => {
        if (userId) {
            navigate(`/profile/${userId}`);  
        } else {
            alert("No user in the chat room");
        }
    }

    const handleSettings = () => {
        navigate('settings');
    }
  return (
    <div className='navBar'>
       <div className='navBar-left'>
        <h1>Naziv App</h1>
       </div>
       <div className='navBar-right'>
        <FontAwesomeIcon icon={faMoon} />
        <FontAwesomeIcon icon={faPersonRifle} onClick={handleProfile} />
        <FontAwesomeIcon icon={faGear} onClick={handleSettings} />
       </div>
    </div>
  )
}

export default Navbar;
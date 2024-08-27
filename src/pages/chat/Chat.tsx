import { Outlet } from 'react-router-dom';
import './chat.scss';

const Chat = () => {
  return (
    <div className='chat-container'>
        <div className='chat-content'>
            <Outlet />
        </div>
    </div>
  )
}

export default Chat;
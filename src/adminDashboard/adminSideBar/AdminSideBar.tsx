import { useAuth } from '../../context/AuthContext';
import './adminSideBar.scss';
import { Link } from 'react-router-dom';

const AdminSideBar = () => {
    const { logout } = useAuth();

    const handleLogout = () => {   
        logout()  ; 
    }
    return (
        <div className='admin-sidebar'>
           <div className='admin-sidebar-container'>
               <ul>
                   <li><Link to={'/admin/dashboard/users'}>Users</Link></li>
                   <li><Link to={'/admin/dashboard/messages'}>Messages</Link></li>
                   <li><Link to={'/admin/dashboard/deletionRequests'}>Deletion Requests</Link></li>
               </ul>
           </div>
           <div className='admin-sidebar-logout'>
                <button type='button' onClick={() => handleLogout()}>Logout</button>
           </div>
        </div>
     )
}

export default AdminSideBar
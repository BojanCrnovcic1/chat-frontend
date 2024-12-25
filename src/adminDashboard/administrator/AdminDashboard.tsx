import AdminSideBar from '../adminSideBar/AdminSideBar';
import './adminDashoard.scss'
import { Outlet } from 'react-router-dom';

const AdminDashboard = () => {
   
    return (
      <div className='admin-dashboard'>
         <AdminSideBar />
         <div className='admin-container'>
             <div className='main-content'>
                 <h1>Administrator Panel</h1>
             </div>
             <div className='content'>
                 <Outlet />
             </div>
        </div>
      </div>
   )
}

export default AdminDashboard;
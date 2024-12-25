import './App.scss';
import Navbar from './components/navBar/Navbar';
import Sidebar from './components/sideBar/Sidebar';
import Chat from './pages/chat/Chat';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import LoginPage from './pages/login/LoginPage';
import RegisterPage from './pages/register/RegisterPage';
import NoChatSelected from './components/noChatSelected/NoChatSelected';
import Room from './components/room/Room';
import Settings from './components/settings/Settings';
import { useAuth } from './context/AuthContext';
import Notification from './components/notification/Notification';
import { useEffect, useState } from 'react';
import AdminDashboard from './adminDashboard/administrator/AdminDashboard';
import Users from './adminDashboard/adminComponents/users/Users';
import Messages from './adminDashboard/adminComponents/messages/Messages';
import DeletionRequests from './adminDashboard/adminComponents/deletionRequests/DeletionRequests';

const App = () => {
  const { token, user, role } = useAuth();
  const navigate = useNavigate();
  const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(false);

  const toggleSidebar = () => {
    setIsSidebarVisible((prev) => !prev);
  };

  useEffect(() => {
    console.log('Current role:', role);
    if (role === 'admin' && !window.location.pathname.startsWith('/admin/dashboard')) {
      navigate('/admin/dashboard');
    }
  }, [role, navigate]);
  

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsSidebarVisible(true);
      } else {
        setIsSidebarVisible(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (!token) {
      return <Navigate to={'/login'} />;
    }
    
    return <>{children}</>;
  }; 

  const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    console.log('Token:', token, 'Role:', role);
  
    if (!token) {
      return <Navigate to={'/login'} />;
    }
  
    if (role === 'admin') {
      if (!window.location.pathname.startsWith('/admin/dashboard')) {
        return <Navigate to={'/admin/dashboard'} />;
      }
    } else {
      return <Navigate to="/login" />;
    }
  
    return <>{children}</>;
  };
  
  
  const Layout = () => {
    return (
      <div>
        <Navbar toggleSidebar={toggleSidebar} />
        <div className="section">
          {isSidebarVisible && <Sidebar isSidebarVisible={isSidebarVisible} setSidebarVisible={setIsSidebarVisible} />}
          <Chat />
        </div>
      </div>
    );
  };

  return (
    <Routes>    
        <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index={true} element={<NoChatSelected />} />
        <Route path="room/:id" element={<Room />} />
        <Route path="settings" element={<Settings />} />
        <Route path="notifications" element={user?.userId && <Notification userId={user?.userId} />} />
      </Route>
      
        <Route
        path="/admin/dashboard/*"
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }>
          <Route path='users' element={<Users />} />
          <Route path='messages' element={<Messages />} />
          <Route path='deletionRequests' element={<DeletionRequests />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
};

export default App;

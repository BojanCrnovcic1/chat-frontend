import './App.scss'
import Navbar from './components/navBar/Navbar'
import Sidebar from './components/sideBar/Sidebar'
import Chat from './pages/chat/Chat'
import { Navigate, Route, Routes} from 'react-router-dom'
import LoginPage from './pages/login/LoginPage'
import RegisterPage from './pages/register/RegisterPage'
import NoChatSelected from './components/noChatSelected/NoChatSelected'
import Room from './components/room/Room'
import Profile from './components/profile/Profile'
import Settings from './components/settings/Settings'
import { useAuth } from './context/AuthContext'
import Notification from './components/notification/Notification'

const App = () => {
  const { token, user } = useAuth();
 
 
  



  const ProtectedRoute: React.FC<({ children: React.ReactNode})> = ({ children }) => {
    if (!token) {
      return <Navigate to={'/login'} />
    }
    return children;
  } 

  const Layout = () => {
    return (
      <div>   
          <Navbar  />      
        <div className='section'>
          <Sidebar />
          <Chat />
        </div>
      </div>
    )
  };

  return (
    <Routes>
        <Route path='/' element={
          <ProtectedRoute>
             <Layout />
          </ProtectedRoute>
        } >
            <Route index={true} element={<NoChatSelected />} />
            <Route path='room/:id' element={<Room />} />
            <Route path='profile/:id' element={<Profile />} />
            <Route path='settings' element={<Settings />} />
            <Route path='notifications' element={user?.userId && <Notification userId={user?.userId}/>} />
        </Route>
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
    </Routes>
  )
}

export default App;

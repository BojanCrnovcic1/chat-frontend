import './App.scss'
import Navbar from './components/navBar/Navbar'
import Sidebar from './components/sideBar/Sidebar'
import Chat from './pages/chat/Chat'
import { Route, Routes} from 'react-router-dom'
import LoginPage from './pages/login/LoginPage'
import RegisterPage from './pages/register/RegisterPage'
import NoChatSelected from './components/noChatSelected/NoChatSelected'
import Room from './components/room/Room'
import Profile from './components/profile/Profile'
import Settings from './components/settings/Settings'

const App = () => {

  const Layout = () => {
    return (
      <div>
        <Navbar />
        <div className='section'>
          <Sidebar />
          <Chat />
        </div>
      </div>
    )
  };

  return (
    <Routes>
        <Route path='/' element={<Layout />} >
            <Route index={true} element={<NoChatSelected />} />
            <Route path='room/:id' element={<Room />} />
            <Route path='profile/:id' element={<Profile />} />
            <Route path='settings' element={<Settings />} />
        </Route>
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
    </Routes>
  )
}

export default App;

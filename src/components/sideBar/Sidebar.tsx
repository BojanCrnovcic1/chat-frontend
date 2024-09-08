
import Search from '../search/Search';
import './sideBar.scss';

const Sidebar = () => {
  return (
    <div className='sideBar'>
        <div className='sideBar-search'>
            <Search />
        </div>
        <div className='sideBar-friends'></div>
    </div>
  )
}

export default Sidebar;
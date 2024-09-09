
import Friends from '../friends/Friends';
import Search from '../search/Search';
import './sideBar.scss';

const Sidebar = () => {
  return (
    <div className='sideBar'>
        <div className='sideBar-search'>
            <Search />
        </div>
        <div className='sideBar-message'></div>
        <div className='sideBar-friends'>
            <Friends />
        </div>
    </div>
  )
}

export default Sidebar;
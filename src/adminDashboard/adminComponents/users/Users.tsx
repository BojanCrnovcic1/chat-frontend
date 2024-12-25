import { useState, useEffect } from 'react';
import './users.scss';
import { User } from '../../../types/User';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import { ApiConfig } from '../../../config/ApiConfig';
import { formatDistanceToNow } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDeleteLeft, faMessage } from '@fortawesome/free-solid-svg-icons';
import SendMessageModal from '../../../modals/admin/SendMessageModal';
import { defaultProfile } from '../../../misc/defaultProfile';

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(10);
  const [showSendMessageModal, setShowSendMessageModal] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const { token } = useAuth();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get<{ data: User[]; total: number }>(
        ApiConfig.API_URL + 'api/admin/filter-users',
        {
          params: {
            page,
            pageSize,
            searchTerm,
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers(response.data.data);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, pageSize, searchTerm]); 

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < Math.ceil(total / pageSize)) setPage(page + 1);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(event.target.value));
    setPage(1); 
  };

  const handleSendMessageModal = () => {
    setSelectedUserId(null);
    setShowSendMessageModal(false);
  };

  return (
    <div className="users">
      <h2>Users table</h2>
      <div className="search-page-container">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by username or email..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>
      <div className="page-size-container">
        <label htmlFor="pageSize">Page size: </label>
        <select
          id="pageSize"
          value={pageSize}
          onChange={handlePageSizeChange}
          className="page-size-select"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Profile photo</th>
              <th>Username</th>
              <th>Email</th>
              <th>Online status</th>
              <th>Last active</th>
              <th>Created At</th>
              <th>Send</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.userId}>
                <td>{user.userId}</td>
                <td>
                  {user.profilePicture ? (
                    <img
                      src={`${ApiConfig.PHOTO_PATH + user.profilePicture}`}
                      alt="Profile"
                      className="profile-picture"
                    />
                  ) : (
                    defaultProfile
                  )}
                </td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.onlineStatus ? 'Online' : 'Offline'}</td>
                <td>
                  {user.lastActive
                    ? formatDistanceToNow(new Date(user.lastActive), {
                        addSuffix: true,
                      })
                    : 'N/A'}
                </td>
                <td>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleString()
                    : 'N/A'}
                </td>
                <td>
                    <button className="message-button"
                             onClick={() => {
                            if (user.userId !== undefined) { 
                                setSelectedUserId(user.userId);
                                setShowSendMessageModal(true);  }
                                }}>
                               <FontAwesomeIcon icon={faMessage} /> Message
                    </button>
                    {showSendMessageModal && selectedUserId && (
                        <SendMessageModal show={showSendMessageModal} userId={selectedUserId} handleClose={handleSendMessageModal} />
                    )}
                </td>
                <td>
                  <button className="delete-button">
                    <FontAwesomeIcon icon={faDeleteLeft} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="pagination">
        <button onClick={handlePreviousPage} disabled={page === 1}>
          Previous
        </button>
        <span>
          Page {page} of {Math.ceil(total / pageSize)}
        </span>
        <button
          onClick={handleNextPage}
          disabled={page === Math.ceil(total / pageSize)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Users;

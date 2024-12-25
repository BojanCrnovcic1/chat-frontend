import { useState, useEffect } from 'react';
import './messages.scss';
import axios from 'axios';
import { MessageType } from '../../../types/MessageType';
import { useAuth } from '../../../context/AuthContext';
import { ApiConfig } from '../../../config/ApiConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDeleteLeft } from '@fortawesome/free-solid-svg-icons';

const Messages = () => {
  const { token } = useAuth(); 
  const [username, setUsername] = useState<string>(''); 
  const [searchTerm, setSearchTerm] = useState<string>(''); 
  const [page, setPage] = useState<number>(1); 
  const [pageSize, setPageSize] = useState<number>(10); 
  const [messages, setMessages] = useState<MessageType[]>([]); 
  const [total, setTotal] = useState<number>(0); 
  const [loading, setLoading] = useState<boolean>(false); 
  const [error, setError] = useState<string | null>(null); 

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(ApiConfig.API_URL + 'api/message/filter-messages', {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
        params: {
          page,
          pageSize,
          username,
          searchTerm,
        },
      });

      const { data, total: totalMessages } = response.data;

      setMessages(data);
      setTotal(totalMessages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred while fetching messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchMessages();
  };

  useEffect(() => {
    fetchMessages();
  }, [page, pageSize, token]);

  const handleDeleteMessage = async (messageId: number) => {
    try {
      await axios.delete(ApiConfig.API_URL + `api/message/${messageId}/deleteMessage`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error deleting message', error);
    }
  };


  return (
    <div className="messages-container">
      <h1>Messages</h1>
      <div className="search-form">
        <input
          type="text"
          placeholder="Search by username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by keyword"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      <div className="pagination-controls">
        <label>
          Page:
          <input
            type="number"
            min="1"
            value={page}
            onChange={(e) => setPage(Number(e.target.value))}
          />
        </label>
        <label>
          Page Size:
          <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
            {[5, 10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="messages-table">
        <table>
          <thead>
            <tr>
              <th>Content</th>
              <th>Sent To</th>
              <th>Chat Room</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {messages.length > 0 ? (
              messages.map((message) => (
                <tr key={message.messageId}>
                  <td>{message.content || 'No Content'}</td>
                  <td>{message.user?.username || 'Unknown'}</td>
                  <td>{message.chatRoom?.name || 'General'}</td>
                  <td>
                    {message.createdAt
                      ? new Date(message.createdAt).toLocaleString()
                      : 'Unknown'}
                  </td>
                  <td>
                  <button className="delete-button" onClick={() => message.messageId && handleDeleteMessage(message.messageId)}>
                    <FontAwesomeIcon icon={faDeleteLeft} /> Delete
                  </button>
                </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>No messages found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="pagination-summary">
        <p>
          Showing {messages.length} of {total} messages
        </p>
      </div>
    </div>
  );
};

export default Messages;


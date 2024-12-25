import { useState, useEffect } from 'react';
import axios from 'axios';
import { ApiConfig } from '../../../config/ApiConfig';
import './deletionRequests.scss';
import { useAuth } from '../../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDeleteLeft } from '@fortawesome/free-solid-svg-icons';
import DeleteUserModal from '../../../modals/user/DeleteUserModal';
import { AccountDeleteRequestType } from '../../../types/AccountDeleteRequestType';

const DeletionRequests = () => {
  const { token } = useAuth();
  const [requests, setRequests] = useState<AccountDeleteRequestType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchDeletionRequests = async () => {
      setLoading(true);
      try {
        const response = await axios.get<AccountDeleteRequestType[]>(
          ApiConfig.API_URL + 'api/admin/deletion-requests',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const sortedRequests = response.data.sort((a, b) => {
          const dateA = a.requestedAt ? new Date(a.requestedAt).getTime() : 0;
          const dateB = b.requestedAt ? new Date(b.requestedAt).getTime() : 0;
          return dateB - dateA;
        });
        setRequests(sortedRequests);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error fetching deletion requests');
      } finally {
        setLoading(false);
      }
    };

    fetchDeletionRequests();
  }, [token]);

  const handleDeleteUserModal = () => {
    setShowDeleteUserModal(false);
    setSelectedUserId(null);
  };

  return (
    <div className="deletion-requests">
      <h2>Account Deletion Requests</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Reason</th>
              <th>Requested At</th>
              <th>Reviewed Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length > 0 ? (
              requests.map((request) => (
                <tr key={request.user?.userId}>
                  <td>{request.user?.userId}</td>
                  <td>{request.user?.username}</td>
                  <td>{request.user?.email}</td>
                  <td>{request.reason || 'No reason provided'}</td>
                  <td>{request.requestedAt ? new Date(request.requestedAt).toLocaleString() : 'N/A'}</td>
                  <td>{request.isReviewed ? 'Reviewed' : 'Pending'}</td>
                  <td>
                    <button
                      className="delete-button"
                      onClick={() => {
                        setSelectedUserId(request.user?.userId || null);
                        setShowDeleteUserModal(true);
                      }}
                    >
                      <FontAwesomeIcon icon={faDeleteLeft} /> Delete
                    </button>
                    {showDeleteUserModal && selectedUserId && (
                      <DeleteUserModal
                        show={showDeleteUserModal}
                        userId={selectedUserId}
                        handleClose={handleDeleteUserModal}
                      />
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7}>No deletion requests found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DeletionRequests;

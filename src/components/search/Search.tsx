import React, { useState, useEffect } from 'react';
import './search.scss';
import { User } from '../../types/User';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { ApiConfig } from '../../config/ApiConfig';
import { defaultProfile } from '../../misc/defaultProfile';

const Search: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [results, setResults] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [friendRequestMessage, setFriendRequestMessage] = useState<string | null>(null);
    const [friendRequestsSent, setFriendRequestsSent] = useState<number[]>([]);
    const { token } = useAuth();

    useEffect(() => {
        if (!searchTerm) {
            setResults([]);
            setError(null)
            setFriendRequestMessage(null);
            return;
        }
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm) {
                handleSearch();
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleSearch = async () => {
        setLoading(true);
        setError(null);
        setFriendRequestMessage(null); 

        try {
            const response = await axios.get<User[]>(ApiConfig.API_URL + 'api/user/search', {
                params: {
                    username: searchTerm
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setResults(response.data);
        } catch (error) {
            setError('Failed to fetch users. Please try again.');
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleAddFriend = async (friendId: number) => {
        if (friendRequestsSent.includes(friendId)) {
            return; 
        }
        
        try {
            await axios.post(ApiConfig.API_URL + 'api/friend/send-request', {friendId}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            setFriendRequestsSent([...friendRequestsSent, friendId]);
            setFriendRequestMessage('Friend request sent successfully.');
        } catch (error) {
            console.error('Failed to send friend request:', error);
            setFriendRequestMessage('Failed to send friend request.');
        }
    }

    const openImageModal = (imageUrl: string) => {
        setSelectedImage(imageUrl);
    }

    const closeImageModal = () => {
        setSelectedImage(null);
    }

    return (
        <div className='search'>
            <input type='text' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                   placeholder='Search users...' 
            />
            {loading && <p>Searching...</p>}
            {error && <p className="message error">{error}</p>}

            <div className='list-search'>
                <ul>
                    {results.map((user) => (
                        <li key={user.userId}>
                            <div className='list-data'>
                                <img src={ApiConfig.PHOTO_PATH + user.profilePicture ? ApiConfig.PHOTO_PATH + user.profilePicture : defaultProfile} alt=''
                                     onClick={() => openImageModal(ApiConfig.PHOTO_PATH + user.profilePicture)} />
                                <span>{user.username}</span>                   
                            </div>
                            <button type='button' disabled={friendRequestsSent.includes(user.userId ?? 0)} onClick={() => user.userId && handleAddFriend(user.userId)}>Add</button>
                        </li>
                    ))}
                </ul>
            </div>
            {friendRequestMessage && (
                <p className={`message ${friendRequestMessage.includes('successfully') ? 'success' : 'error'}`}>
                    {friendRequestMessage}
                </p>
            )}
            {selectedImage && (
                <div className='modalProfile' onClick={closeImageModal}>
                     <span className='close'>&times;</span>
                <img className='modalProfile-content' src={selectedImage} alt="Profile" />
            </div>
            )}
        </div>
    );
}

export default Search;

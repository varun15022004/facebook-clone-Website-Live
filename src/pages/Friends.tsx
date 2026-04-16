import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import FriendCard from '../components/FriendCard';
import { Users, UserPlus } from 'lucide-react';

const Friends: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [friends, setFriends] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchFriendRequests();
    }
  }, [user]);

  const fetchFriends = async () => {
    try {
      const response = await fetch(`/api/friends/${user?._id}`, {
        headers: {
          'userId': user?._id || ''
        }
      });
      
      const data = await response.json();
      setFriends(data);
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const response = await fetch(`/api/friends/requests/${user?._id}`, {
        headers: {
          'userId': user?._id || ''
        }
      });
      
      const data = await response.json();
      setFriendRequests(data);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!window.confirm('Are you sure you want to remove this friend?')) return;
    
    try {
      await fetch(`/api/friends/remove/${user?._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'userId': user?._id || ''
        },
        body: JSON.stringify({ friendId })
      });
      
      // Update friends list
      setFriends(friends.filter(friend => friend._id !== friendId));
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Friends</h1>
          
          {friendRequests.length > 0 && (
            <Link 
              to="/friend-requests"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <UserPlus size={16} className="mr-2" />
              <span>Friend Requests ({friendRequests.length})</span>
            </Link>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : friends.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {friends.map(friend => (
              <FriendCard 
                key={friend._id} 
                friend={friend} 
                onRemoveFriend={handleRemoveFriend}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">You don't have any friends yet.</p>
            <p className="text-gray-600">
              Start by searching for people you know and sending friend requests.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Friends;
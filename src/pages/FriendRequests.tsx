import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import FriendRequestCard from '../components/FriendRequestCard';
import { UserPlus, ArrowLeft } from 'lucide-react';

const FriendRequests: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFriendRequests();
    }
  }, [user]);

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
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (senderId: string) => {
    try {
      await fetch(`/api/friends/accept/${user?._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'userId': user?._id || ''
        },
        body: JSON.stringify({ senderId })
      });
      
      // Update friend requests list
      setFriendRequests(friendRequests.filter(request => request.from._id !== senderId));
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleRejectRequest = async (senderId: string) => {
    try {
      await fetch(`/api/friends/reject/${user?._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'userId': user?._id || ''
        },
        body: JSON.stringify({ senderId })
      });
      
      // Update friend requests list
      setFriendRequests(friendRequests.filter(request => request.from._id !== senderId));
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Link to="/friends" className="flex items-center text-blue-600 hover:underline">
            <ArrowLeft size={16} className="mr-1" />
            <span>Back to Friends</span>
          </Link>
        </div>
        
        <div className="flex items-center mb-6">
          <UserPlus size={24} className="text-blue-600 mr-2" />
          <h1 className="text-2xl font-bold">Friend Requests</h1>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : friendRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {friendRequests.map(request => (
              <FriendRequestCard 
                key={request.from._id} 
                request={request} 
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <UserPlus size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">You don't have any friend requests.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendRequests;
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { SocketContext } from '../contexts/SocketContext';
import Navbar from '../components/Navbar';
import Post from '../components/Post';
import Chat from '../components/Chat';
import { MapPin, Cake, UserPlus, UserCheck, UserX, MessageCircle } from 'lucide-react';
import { resolveMediaUrl } from '../utils/media';

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [friendStatus, setFriendStatus] = useState<'none' | 'friends' | 'pending'>('none');
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (id && user) {
      if (id === user._id || id === user.id) {
        navigate('/profile');
        return;
      }
      fetchUserProfile();
      fetchUserPosts();
    }
  }, [id, user, navigate]);

  // Close chat when navigating to a different profile
  useEffect(() => {
    setShowChat(false);
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        headers: {
          'userId': user?._id || ''
        }
      });
      
      const userData = await response.json();
      setProfileUser(userData);
      
      // Check friend status
      if (userData.friends && userData.friends.some((friend: any) => friend._id === user?._id || friend.id === user?._id)) {
        setFriendStatus('friends');
      } else {
        // Check if there's a pending request
        const requestResponse = await fetch(`/api/friends/requests/${user?._id}`, {
          headers: {
            'userId': user?._id || ''
          }
        });
        
        const requests = await requestResponse.json();
        const isPending = Array.isArray(requests) && requests.some((request: any) => request.from?._id === id || request.from?.id === id);
        
        setFriendStatus(isPending ? 'pending' : 'none');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await fetch(`/api/posts/user/${id}`, {
        headers: {
          'userId': user?._id || ''
        }
      });
      
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendFriendRequest = async () => {
    if (isSendingRequest) return;
    
    setIsSendingRequest(true);
    
    try {
      await fetch(`/api/friends/request/${user?._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'userId': user?._id || ''
        },
        body: JSON.stringify({ recipientId: id })
      });
      
      setFriendStatus('pending');
    } catch (error) {
      console.error('Error sending friend request:', error);
    } finally {
      setIsSendingRequest(false);
    }
  };

  const handleAcceptFriendRequest = async () => {
    try {
      await fetch(`/api/friends/accept/${user?._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'userId': user?._id || ''
        },
        body: JSON.stringify({ senderId: id })
      });
      
      setFriendStatus('friends');
      fetchUserProfile(); // Refresh profile to update friends list
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleRemoveFriend = async () => {
    if (!window.confirm('Are you sure you want to remove this friend?')) return;
    
    try {
      await fetch(`/api/friends/remove/${user?._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'userId': user?._id || ''
        },
        body: JSON.stringify({ friendId: id })
      });
      
      setFriendStatus('none');
      setShowChat(false); // Close chat if friend removed
      fetchUserProfile(); // Refresh profile to update friends list
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  const handlePostUpdated = () => {
    fetchUserPosts();
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (!profileUser && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">User not found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto">
        {/* Cover Photo */}
        <div className="relative h-72 bg-slate-300 rounded-b-3xl shadow-sm overflow-hidden">
          {profileUser?.coverPhoto ? (
            <img 
              src={resolveMediaUrl(profileUser.coverPhoto)} 
              alt="Cover" 
              className="w-full h-full object-cover animate-fade-in"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-brand-600 via-brand-500 to-purple-600"></div>
          )}
        </div>
        
        {/* Profile Info */}
        <div className="relative bg-white shadow-soft rounded-3xl mx-4 -mt-10 px-8 pb-8 z-10 animate-fade-up">
          <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-24 mb-6">
            <div className="relative group/avatar">
              <img 
                src={profileUser?.profilePicture ? resolveMediaUrl(profileUser.profilePicture) : 'https://via.placeholder.com/150'} 
                alt="Profile" 
                className="w-36 h-36 sm:w-44 sm:h-44 rounded-full border-[6px] border-white shadow-md object-cover transition-transform duration-300"
              />
            </div>
            
            <div className="mt-4 sm:mt-0 sm:ml-8 text-center sm:text-left flex-1 pb-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">{profileUser?.firstName} {profileUser?.lastName}</h1>
              
              <div className="mt-3">
                {profileUser?.bio && <p className="text-slate-600 mb-4 text-[17px] leading-relaxed max-w-2xl">{profileUser.bio}</p>}
                
                <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                  {profileUser?.location && (
                    <div className="flex items-center text-slate-500 font-medium">
                      <MapPin size={18} className="mr-1.5 text-brand-500" />
                      <span>{profileUser.location}</span>
                    </div>
                  )}
                  
                  {profileUser?.birthday && (
                    <div className="flex items-center text-slate-500 font-medium">
                      <Cake size={18} className="mr-1.5 text-brand-500" />
                      <span>Born {formatDate(profileUser.birthday)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="ml-auto mt-6 sm:mt-0 mb-2 sm:mb-0 flex gap-3">
              {user?._id !== id && (
                <>
                  {friendStatus === 'none' && (
                    <button 
                      className="btn btn-primary"
                      onClick={handleSendFriendRequest}
                      disabled={isSendingRequest}
                    >
                      <UserPlus size={18} />
                      <span>{isSendingRequest ? 'Sending...' : 'Add Friend'}</span>
                    </button>
                  )}
                  
                  {friendStatus === 'pending' && (
                    <button 
                      className="btn bg-green-500 hover:bg-green-600 text-white"
                      onClick={handleAcceptFriendRequest}
                    >
                      <UserCheck size={18} />
                      <span>Accept Request</span>
                    </button>
                  )}
                  
                  {friendStatus === 'friends' && (
                    <>
                      <button 
                        className="btn btn-primary"
                        onClick={() => setShowChat(!showChat)}
                      >
                        <MessageCircle size={18} />
                        <span>{showChat ? 'Close Chat' : 'Message'}</span>
                      </button>
                      <button 
                        className="btn bg-slate-100 hover:bg-slate-200 text-slate-700"
                        onClick={handleRemoveFriend}
                      >
                        <UserX size={18} />
                        <span>Remove Friend</span>
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
          
          <div className="mt-8">
            <div className="flex justify-between items-center mb-6 px-2">
              <h2 className="text-2xl font-bold text-slate-800">Posts</h2>
              
              <div className="flex space-x-4">
                <Link 
                  to={`/profile/${id}/friends`}
                  className="bg-brand-50 text-brand-600 px-4 py-1.5 rounded-full font-medium hover:bg-brand-100 transition-colors"
                >
                  {profileUser?.friends?.length || 0} Friends
                </Link>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center my-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
              </div>
            ) : posts.length > 0 ? (
              posts.map(post => (
                <Post key={post._id} post={post} onPostUpdated={handlePostUpdated} />
              ))
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
                <p className="text-slate-500 font-medium text-lg">No posts yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Window */}
      {showChat && socket && profileUser && user && (
        <Chat
          recipientId={profileUser._id || profileUser.id}
          recipientName={`${profileUser.firstName} ${profileUser.lastName}`}
          recipientImage={profileUser.profilePicture ? resolveMediaUrl(profileUser.profilePicture) : ''}
          onClose={() => setShowChat(false)}
          socket={socket}
          userId={user._id}
        />
      )}
    </div>
  );
};

export default UserProfile;
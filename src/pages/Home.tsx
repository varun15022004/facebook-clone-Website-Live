import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import CreatePost from '../components/CreatePost';
import Post from '../components/Post';
import StoryCard from '../components/StoryCard';
import CreateStory from '../components/CreateStory';
import { Link } from 'react-router-dom';
import { Users, Bell } from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPosts();
      fetchStories();
      fetchFriendRequests();
    }
  }, [user]);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/feed/${user?._id}`, {
        headers: {
          'userId': user?._id || ''
        }
      });
      
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStories = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/stories/feed/${user?._id}`, {
        headers: {
          'userId': user?._id || ''
        }
      });
      
      const data = await response.json();
      setStories(data);
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/friends/requests/${user?._id}`, {
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

  const handlePostCreated = () => {
    fetchPosts();
  };

  const handlePostUpdated = () => {
    fetchPosts();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Stories */}
        <div className="mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            <CreateStory />
            
            {stories.slice(0, 4).map(story => (
              <StoryCard key={story._id} story={story} />
            ))}
          </div>
          
          {stories.length > 4 && (
            <div className="mt-2 text-center">
              <Link to="/stories" className="text-blue-600 hover:underline">
                See all stories
              </Link>
            </div>
          )}
        </div>
        
        {/* Notifications */}
        {friendRequests.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex items-center text-blue-600 mb-2">
              <Users size={20} className="mr-2" />
              <span className="font-semibold">Friend Requests</span>
            </div>
            <p>You have {friendRequests.length} pending friend request(s)</p>
            <Link 
              to="/friend-requests"
              className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              View Requests
            </Link>
          </div>
        )}
        
        {/* Create Post */}
        <CreatePost onPostCreated={handlePostCreated} />
        
        {/* Posts */}
        {isLoading ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : posts.length > 0 ? (
          posts.map(post => (
            <Post key={post._id} post={post} onPostUpdated={handlePostUpdated} />
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">No posts to show.</p>
            <p className="text-gray-600">
              Start by creating a post or adding friends to see their posts in your feed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
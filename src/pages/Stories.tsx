import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import StoryCard from '../components/StoryCard';
import CreateStory from '../components/CreateStory';

const Stories: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [stories, setStories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStories();
    }
  }, [user]);

  const fetchStories = async () => {
    try {
      const response = await fetch(`/api/stories/feed/${user?._id}`, {
        headers: {
          'userId': user?._id || ''
        }
      });
      
      const data = await response.json();
      setStories(data);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Stories</h1>
        
        {isLoading ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <CreateStory />
            
            {stories.map(story => (
              <StoryCard key={story._id} story={story} />
            ))}
            
            {stories.length === 0 && !isLoading && (
              <div className="col-span-full bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600">No stories to show.</p>
                <p className="text-gray-600 mt-2">Create a story or add friends to see their stories.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Stories;
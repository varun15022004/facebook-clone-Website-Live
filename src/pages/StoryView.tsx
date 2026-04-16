import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { resolveMediaUrl } from '../utils/media';

const StoryView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [story, setStory] = useState<any>(null);
  const [stories, setStories] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (user && id) {
      fetchStory();
      fetchAllStories();
    }
  }, [user, id]);

  useEffect(() => {
    if (story) {
      // Start progress bar
      const duration = 5000; // 5 seconds per story
      const interval = 50; // Update every 50ms
      const step = (interval / duration) * 100;
      
      let currentProgress = 0;
      const timer = setInterval(() => {
        currentProgress += step;
        setProgress(currentProgress);
        
        if (currentProgress >= 100) {
          clearInterval(timer);
          goToNextStory();
        }
      }, interval);
      
      return () => clearInterval(timer);
    }
  }, [story]);

  const fetchStory = async () => {
    try {
      const response = await fetch(`/api/stories/${id}/${user?._id}`, {
        headers: {
          'userId': user?._id || ''
        }
      });
      
      const data = await response.json();
      setStory(data);
    } catch (error) {
      console.error('Error fetching story:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllStories = async () => {
    try {
      const response = await fetch(`/api/stories/feed/${user?._id}`, {
        headers: {
          'userId': user?._id || ''
        }
      });
      
      const data = await response.json();
      setStories(data);
      
      // Find index of current story
      const index = data.findIndex((s: any) => s._id === id);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
  };

  const goToPreviousStory = () => {
    if (currentIndex > 0) {
      const prevStory = stories[currentIndex - 1];
      navigate(`/stories/${prevStory._id}`);
    } else {
      navigate('/stories');
    }
  };

  const goToNextStory = () => {
    if (currentIndex < stories.length - 1) {
      const nextStory = stories[currentIndex + 1];
      navigate(`/stories/${nextStory._id}`);
    } else {
      navigate('/stories');
    }
  };

  const handleClose = () => {
    navigate('/stories');
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p className="mb-4">Story not found or has expired.</p>
          <button 
            className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700"
            onClick={() => navigate('/stories')}
          >
            Back to Stories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-700">
        <div 
          className="h-full bg-white"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      {/* Close button */}
      <button 
        className="absolute top-4 right-4 p-2 rounded-full bg-black bg-opacity-50 text-white z-10"
        onClick={handleClose}
      >
        <X size={24} />
      </button>
      
      {/* Navigation buttons */}
      <button 
        className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 text-white z-10"
        onClick={goToPreviousStory}
      >
        <ChevronLeft size={24} />
      </button>
      
      <button 
        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 text-white z-10"
        onClick={goToNextStory}
      >
        <ChevronRight size={24} />
      </button>
      
      {/* Story content */}
      <div className="relative max-w-lg w-full h-full max-h-screen flex items-center justify-center">
        {story.image ? (
          <img 
            src={resolveMediaUrl(story.image)} 
            alt="Story" 
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center p-8">
            <p className="text-white text-xl text-center">{story.content}</p>
          </div>
        )}
        
        {/* User info */}
        <div className="absolute top-4 left-4 flex items-center">
          <img 
            src={story.user.profilePicture ? resolveMediaUrl(story.user.profilePicture) : 'https://via.placeholder.com/40'} 
            alt={`${story.user.firstName} ${story.user.lastName}`}
            className="w-10 h-10 rounded-full border-2 border-blue-500"
          />
          <div className="ml-2">
            <p className="text-white font-medium">{story.user.firstName} {story.user.lastName}</p>
            <p className="text-gray-300 text-sm">
              {new Date(story.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryView;
import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import ReelCard from '../components/ReelCard';
import { Plus } from 'lucide-react';

const Reels: React.FC = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [reels, setReels] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchReels();
    }
  }, [user]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        navigateToPreviousReel();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        navigateToNextReel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex, reels.length]);

  const fetchReels = async () => {
    try {
      const response = await fetch('/api/reels', {
        headers: {
          'userId': user?._id || ''
        }
      });
      
      const data = await response.json();
      
      // Add current user ID to each reel for like status
      const reelsWithCurrentUser = data.map((reel: any) => ({
        ...reel,
        currentUserId: user?._id
      }));
      
      setReels(reelsWithCurrentUser);
    } catch (error) {
      console.error('Error fetching reels:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikeReel = async (reelId: string) => {
    try {
      await fetch(`/api/reels/${reelId}/like/${user?._id}`, {
        method: 'POST',
        headers: {
          'userId': user?._id || ''
        }
      });
      
      // Update reels state
      setReels(reels.map(reel => {
        if (reel._id === reelId) {
          const isLiked = reel.likes.includes(user?._id);
          return {
            ...reel,
            likes: isLiked
              ? reel.likes.filter((id: string) => id !== user?._id)
              : [...reel.likes, user?._id]
          };
        }
        return reel;
      }));
    } catch (error) {
      console.error('Error liking reel:', error);
    }
  };

  const handleCommentReel = (reelId: string) => {
    navigate(`/reels/${reelId}`);
  };

  const navigateToPreviousReel = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      scrollToReel(currentIndex - 1);
    }
  };

  const navigateToNextReel = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex(currentIndex + 1);
      scrollToReel(currentIndex + 1);
    }
  };

  const scrollToReel = (index: number) => {
    if (containerRef.current) {
      const reelHeight = containerRef.current.clientHeight;
      containerRef.current.scrollTo({
        top: index * reelHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="fixed top-16 right-4 z-10 mt-4">
        <Link 
          to="/reels/create"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus size={16} className="mr-2" />
          <span>Create Reel</span>
        </Link>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      ) : reels.length > 0 ? (
        <div 
          ref={containerRef}
          className="h-[calc(100vh-64px)] overflow-y-auto snap-y snap-mandatory"
          style={{ scrollSnapType: 'y mandatory' }}
        >
          {reels.map((reel, index) => (
            <div 
              key={reel._id} 
              className="h-[calc(100vh-64px)] snap-start"
              onWheel={(e) => {
                if (e.deltaY > 0 && index < reels.length - 1) {
                  setCurrentIndex(index + 1);
                } else if (e.deltaY < 0 && index > 0) {
                  setCurrentIndex(index - 1);
                }
              }}
            >
              <ReelCard 
                reel={reel} 
                isActive={index === currentIndex}
                onLike={handleLikeReel}
                onComment={handleCommentReel}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] text-white">
          <p className="text-xl mb-4">No reels available</p>
          <Link 
            to="/reels/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Your First Reel
          </Link>
        </div>
      )}
    </div>
  );
};

export default Reels;
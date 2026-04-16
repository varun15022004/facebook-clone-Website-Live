import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import CommentSection from '../components/CommentSection';
import { Heart, MessageCircle, ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { resolveMediaUrl } from '../utils/media';

const ReelView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useContext(AuthContext);
  const [reel, setReel] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiking, setIsLiking] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (user && id) {
      fetchReel();
    }
  }, [user, id]);

  const fetchReel = async () => {
    try {
      const response = await fetch(`/api/reels/${id}`, {
        headers: {
          'userId': user?._id || ''
        }
      });
      
      const data = await response.json();
      setReel(data);
    } catch (error) {
      console.error('Error fetching reel:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    
    try {
      await fetch(`/api/reels/${id}/like/${user?._id}`, {
        method: 'POST',
        headers: {
          'userId': user?._id || ''
        }
      });
      
      // Update reel state
      setReel(prevReel => {
        const isLiked = prevReel.likes.includes(user?._id);
        return {
          ...prevReel,
          likes: isLiked
            ? prevReel.likes.filter((likeId: string) => likeId !== user?._id)
            : [...prevReel.likes, user?._id]
        };
      });
    } catch (error) {
      console.error('Error liking reel:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleCommentAdded = () => {
    fetchReel();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-6 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!reel) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">Reel not found.</p>
            <Link 
              to="/reels"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Reels
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isLiked = reel.likes.includes(user?._id);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Link to="/reels" className="flex items-center text-blue-600 hover:underline">
            <ArrowLeft size={16} className="mr-1" />
            <span>Back to Reels</span>
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 bg-black relative">
              <video
                ref={videoRef}
                src={resolveMediaUrl(reel.video)}
                className="w-full h-full object-contain"
                controls
                autoPlay
                loop
                muted={isMuted}
                playsInline
                preload="metadata"
              />
              
              <button 
                className="absolute bottom-4 right-4 p-2 rounded-full bg-black bg-opacity-50 text-white"
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            </div>
            
            <div className="md:w-1/2 p-4">
              <div className="flex items-center mb-4">
                <Link to={`/profile/${reel.user._id}`} className="flex items-center">
                  <img 
                    src={reel.user.profilePicture ? resolveMediaUrl(reel.user.profilePicture) : 'https://via.placeholder.com/40'} 
                    alt={`${reel.user.firstName} ${reel.user.lastName}`}
                    className="w-10 h-10 rounded-full mr-3 border-2 border-white"
                  />
                  <div>
                    <p className="font-semibold">{reel.user.firstName} {reel.user.lastName}</p>
                    <p className="text-gray-500 text-sm">
                      {new Date(reel.createdAt).toLocaleString()}
                    </p>
                  </div>
                </Link>
              </div>
              
              {reel.caption && (
                <p className="mb-4">{reel.caption}</p>
              )}
              
              <div className="flex items-center mb-6">
                <button 
                  className={`flex items-center mr-4 ${isLiked ? 'text-red-500' : 'text-gray-600'}`}
                  onClick={handleLike}
                >
                  <Heart size={24} className={isLiked ? 'fill-current' : ''} />
                  <span className="ml-1">{reel.likes.length}</span>
                </button>
                
                <div className="flex items-center text-gray-600">
                  <MessageCircle size={24} />
                  <span className="ml-1">{reel.comments.length}</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold mb-4">Comments</h3>
                <CommentSection 
                  postId={reel._id} 
                  reelId={reel._id}
                  comments={reel.comments}
                  onCommentAdded={handleCommentAdded}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReelView;
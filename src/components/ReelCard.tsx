import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Volume2, VolumeX, Share2 } from 'lucide-react';
import { resolveMediaUrl } from '../utils/media';
import ShareReelModal from './ShareReelModal';

interface ReelCardProps {
  reel: any;
  isActive: boolean;
  onLike: (reelId: string) => void;
  onComment: (reelId: string) => void;
}

const ReelCard: React.FC<ReelCardProps> = ({ reel, isActive, onLike, onComment }) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(error => {
          console.error('Error playing video:', error);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isActive]);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const isLiked = reel.likes.includes(reel.currentUserId);

  return (
    <div className="relative h-full w-full bg-slate-950 rounded-2xl overflow-hidden shadow-soft animate-fade-up group">
      <video
        ref={videoRef}
        src={resolveMediaUrl(reel.video)}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loop
        muted={isMuted}
        playsInline
        preload="metadata"
      />
      
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent">
        <div className="flex items-start">
          <Link to={`/profile/${reel.user._id}`} className="flex items-center group/user">
            <img 
              src={reel.user.profilePicture ? resolveMediaUrl(reel.user.profilePicture) : 'https://via.placeholder.com/40'} 
              alt={`${reel.user.firstName} ${reel.user.lastName}`}
              className="w-11 h-11 rounded-full border-[3px] border-white/20 mr-3 object-cover group-hover/user:border-white transition-colors"
            />
            <span className="text-white font-semibold drop-shadow-md">{reel.user.firstName} {reel.user.lastName}</span>
          </Link>
        </div>
        
        {reel.caption && (
          <p className="text-white mt-2">{reel.caption}</p>
        )}
      </div>
      
      <div className="absolute right-4 bottom-24 flex flex-col items-center space-y-5">
        <button 
          className={`p-3 rounded-full backdrop-blur-md bg-white/10 hover:bg-white/20 transition-all active:scale-95 ${isLiked ? 'text-brand-400' : 'text-white'}`}
          onClick={() => onLike(reel._id)}
        >
          <Heart size={26} className={isLiked ? 'fill-current scale-110 transition-transform' : 'transition-transform'} />
          <span className="text-xs font-semibold block mt-1 drop-shadow-md">{reel.likes.length}</span>
        </button>
        
        <button 
          className="p-3 rounded-full backdrop-blur-md bg-white/10 hover:bg-white/20 transition-all active:scale-95 text-white"
          onClick={() => onComment(reel._id)}
        >
          <MessageCircle size={26} />
          <span className="text-xs font-semibold block mt-1 drop-shadow-md">{reel.comments.length}</span>
        </button>
        
        <button 
          className="p-3 rounded-full backdrop-blur-md bg-white/10 hover:bg-white/20 transition-all active:scale-95 text-white"
          onClick={(e) => { e.stopPropagation(); setIsShareModalOpen(true); }}
        >
          <Share2 size={26} />
          <span className="text-xs font-semibold block mt-1 drop-shadow-md">Share</span>
        </button>
        
        <button 
          className="p-3 rounded-full backdrop-blur-md bg-white/10 hover:bg-white/20 transition-all active:scale-95 text-white"
          onClick={toggleMute}
        >
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
      </div>

      {isShareModalOpen && (
        <ShareReelModal 
          reelId={reel._id} 
          onClose={() => setIsShareModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default ReelCard;
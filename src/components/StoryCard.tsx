import React from 'react';
import { Link } from 'react-router-dom';
import { resolveMediaUrl } from '../utils/media';

interface StoryCardProps {
  story: any;
}

const StoryCard: React.FC<StoryCardProps> = ({ story }) => {
  return (
    <Link to={`/stories/${story._id}`} className="relative rounded-2xl overflow-hidden h-56 shadow-soft card-hover group block animate-fade-up">
      {story.image ? (
        <img 
          src={resolveMediaUrl(story.image)} 
          alt="Story" 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-brand-400 via-brand-500 to-brand-600 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
          <p className="text-white text-center px-4 font-semibold text-[15px] shadow-sm leading-tight">{story.content}</p>
        </div>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent">
        <div className="flex items-center">
            <img 
              src={story.user.profilePicture ? resolveMediaUrl(story.user.profilePicture) : 'https://via.placeholder.com/40'} 
              alt={story.user.firstName}
              className="w-10 h-10 rounded-full border-2 border-brand-400 p-0.5 object-cover"
            />
          <p className="text-white text-sm ml-2 truncate">{story.user.firstName} {story.user.lastName}</p>
        </div>
      </div>
    </Link>
  );
};

export default StoryCard;
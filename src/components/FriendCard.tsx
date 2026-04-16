import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { UserMinus } from 'lucide-react';
import { resolveMediaUrl } from '../utils/media';

interface FriendCardProps {
  friend: any;
  onRemoveFriend: (friendId: string) => void;
}

const FriendCard: React.FC<FriendCardProps> = ({ friend, onRemoveFriend }) => {
  const { user } = useContext(AuthContext);

  return (
    <div className="card card-hover p-4 flex items-center justify-between mb-3 animate-fade-up">
      <Link to={`/profile/${friend._id}`} className="flex items-center group/user">
        <img 
          src={friend.profilePicture ? resolveMediaUrl(friend.profilePicture) : 'https://via.placeholder.com/50'} 
          alt={`${friend.firstName} ${friend.lastName}`}
          className="w-12 h-12 rounded-full mr-3 object-cover ring-2 ring-transparent group-hover/user:ring-brand-200 transition-all"
        />
        <div>
          <p className="font-semibold text-slate-800 group-hover/user:text-brand-600 transition-colors">{friend.firstName} {friend.lastName}</p>
        </div>
      </Link>
      
      <button 
        className="p-2.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors active:scale-95"
        onClick={() => onRemoveFriend(friend._id)}
        title="Remove friend"
      >
        <UserMinus size={20} />
      </button>
    </div>
  );
};

export default FriendCard;
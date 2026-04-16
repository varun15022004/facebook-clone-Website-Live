import React from 'react';
import { Link } from 'react-router-dom';
import { resolveMediaUrl } from '../utils/media';

interface OnlineUsersProps {
  onlineUsers: string[];
  users: any[];
}

const OnlineUsers: React.FC<OnlineUsersProps> = ({ onlineUsers, users }) => {
  const onlineUserDetails = users.filter(user => onlineUsers.includes(user._id));

  return (
    <div className="card p-5 animate-fade-up">
      <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        Online Users
      </h2>
      
      {onlineUserDetails.length > 0 ? (
        <div className="space-y-3">
          {onlineUserDetails.map(user => (
            <Link 
              key={user._id} 
              to={`/profile/${user._id}`}
              className="flex items-center hover:bg-slate-50 p-2.5 rounded-xl transition-all duration-200 group/user"
            >
              <div className="relative">
                <img 
                  src={user.profilePicture ? resolveMediaUrl(user.profilePicture) : 'https://via.placeholder.com/40'} 
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover/user:ring-brand-200 transition-all"
                />
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <span className="ml-3 font-semibold text-slate-700 group-hover/user:text-brand-600 transition-colors">{user.firstName} {user.lastName}</span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-slate-500 text-center font-medium py-4">No users online</p>
      )}
    </div>
  );
};

export default OnlineUsers;
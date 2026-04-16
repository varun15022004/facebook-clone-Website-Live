import React from 'react';
import { Link } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { resolveMediaUrl } from '../utils/media';

interface FriendRequestCardProps {
  request: any;
  onAccept: (senderId: string) => void;
  onReject: (senderId: string) => void;
}

const FriendRequestCard: React.FC<FriendRequestCardProps> = ({ request, onAccept, onReject }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center mb-3">
        <Link to={`/profile/${request.from._id}`} className="flex items-center">
          <img 
            src={request.from.profilePicture ? resolveMediaUrl(request.from.profilePicture) : 'https://via.placeholder.com/50'} 
            alt={`${request.from.firstName} ${request.from.lastName}`}
            className="w-12 h-12 rounded-full mr-3"
          />
          <div>
            <p className="font-semibold">{request.from.firstName} {request.from.lastName}</p>
            <p className="text-gray-500 text-sm">Sent you a friend request</p>
          </div>
        </Link>
      </div>
      
      <div className="flex space-x-2">
        <button 
          className="flex-1 bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700"
          onClick={() => onAccept(request.from._id)}
        >
          <div className="flex items-center justify-center">
            <Check size={16} className="mr-1" />
            <span>Accept</span>
          </div>
        </button>
        <button 
          className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-md font-medium hover:bg-gray-300"
          onClick={() => onReject(request.from._id)}
        >
          <div className="flex items-center justify-center">
            <X size={16} className="mr-1" />
            <span>Reject</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default FriendRequestCard;
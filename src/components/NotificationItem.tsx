import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, UserPlus, Check, Image, Film } from 'lucide-react';
import { resolveMediaUrl } from '../utils/media';

interface NotificationItemProps {
  notification: any;
  onMarkAsRead: (notificationId: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getNotificationContent = () => {
    const { type } = notification;
    
    switch (type) {
      case 'like':
        return {
          icon: <Heart size={16} className="text-red-500" />,
          text: 'liked your post',
          link: notification.post ? `/posts/${notification.post._id}` : '/',
        };
      case 'comment':
        return {
          icon: <MessageCircle size={16} className="text-blue-500" />,
          text: 'commented on your post',
          link: notification.post ? `/posts/${notification.post._id}` : '/',
        };
      case 'friend_request':
        return {
          icon: <UserPlus size={16} className="text-green-500" />,
          text: 'sent you a friend request',
          link: '/friend-requests',
        };
      case 'friend_accept':
        return {
          icon: <Check size={16} className="text-green-500" />,
          text: 'accepted your friend request',
          link: `/profile/${notification.sender._id}`,
        };
      case 'message':
        return {
          icon: <MessageCircle size={16} className="text-brand-500" />,
          text: 'sent you a chat notification',
          link: '/', // Can be wired later to deep link into Chat.
        };
      case 'message_photo':
        return {
          icon: <Image size={16} className="text-brand-500" />,
          text: 'sent you a photo',
          link: '/', 
        };
      case 'reel_share':
        return {
          icon: <Film size={16} className="text-purple-500" />,
          text: 'shared a reel with you',
          link: '/', // Can be wired later to deep link to the reel or chat.
        };
      default:
        return {
          icon: null,
          text: 'sent you a notification',
          link: '/',
        };
    }
  };

  const { icon, text, link } = getNotificationContent();

  return (
    <Link 
      to={link}
      className={`block p-4 border-b border-gray-200 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
      onClick={() => !notification.read && onMarkAsRead(notification._id)}
    >
      <div className="flex items-start">
        <img 
          src={notification.sender.profilePicture ? resolveMediaUrl(notification.sender.profilePicture) : 'https://via.placeholder.com/40'} 
          alt={`${notification.sender.firstName} ${notification.sender.lastName}`}
          className="w-10 h-10 rounded-full mr-3 object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center">
            <p className="font-semibold mr-1">{notification.sender.firstName} {notification.sender.lastName}</p>
            <span className="mr-1">{text}</span>
            {icon}
          </div>
          <p className="text-gray-500 text-sm">{formatDate(notification.createdAt)}</p>
        </div>
        {!notification.read && (
          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
        )}
      </div>
    </Link>
  );
};

export default NotificationItem;
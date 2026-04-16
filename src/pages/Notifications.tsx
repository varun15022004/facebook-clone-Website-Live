import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import NotificationItem from '../components/NotificationItem';
import { Bell, CheckSquare } from 'lucide-react';

const Notifications: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications/${user?._id}`, {
        headers: {
          'userId': user?._id || ''
        }
      });
      
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'userId': user?._id || ''
        }
      });
      
      // Update notification in state
      setNotifications(notifications.map(notification => 
        notification._id === notificationId 
          ? { ...notification, read: true } 
          : notification
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch(`/api/notifications/read-all/${user?._id}`, {
        method: 'PUT',
        headers: {
          'userId': user?._id || ''
        }
      });
      
      // Update all notifications in state
      setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Bell size={24} className="text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold">Notifications</h1>
          </div>
          
          {unreadCount > 0 && (
            <button 
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={handleMarkAllAsRead}
            >
              <CheckSquare size={16} className="mr-2" />
              <span>Mark All as Read</span>
            </button>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : notifications.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {notifications.map(notification => (
              <NotificationItem 
                key={notification._id} 
                notification={notification} 
                onMarkAsRead={handleMarkAsRead}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Bell size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">You don't have any notifications.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
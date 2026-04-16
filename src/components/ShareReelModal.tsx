import React, { useState, useEffect, useContext } from 'react';
import { X, Send, Check } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import { resolveMediaUrl } from '../utils/media';

interface ShareReelModalProps {
  reelId: string;
  onClose: () => void;
}

const ShareReelModal: React.FC<ShareReelModalProps> = ({ reelId, onClose }) => {
  const { user } = useContext(AuthContext);
  const [friends, setFriends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sentTo, setSentTo] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    if (user?._id) {
      fetchFriends();
    }
  }, [user]);

  const fetchFriends = async () => {
    try {
      const response = await fetch(`/api/friends/${user?._id}`, {
        headers: { 'userId': user?._id || '' },
        credentials: 'include'
      });
      const data = await response.json();
      setFriends(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (friendId: string) => {
    if (sentTo[friendId]) return;
    
    try {
      const response = await fetch(`/api/reels/${reelId}/share/${user?._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'userId': user?._id || ''
        },
        body: JSON.stringify({ friendId }),
        credentials: 'include'
      });
      
      if (response.ok) {
        setSentTo(prev => ({ ...prev, [friendId]: true }));
      }
    } catch (error) {
      console.error('Error sharing reel:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white rounded-3xl overflow-hidden w-full max-w-sm shadow-lift flex flex-col animate-fade-up">
        
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-lg">Share Reel</h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-2 max-h-[60vh] overflow-y-auto no-scrollbar">
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
            </div>
          ) : friends.length > 0 ? (
            friends.map(friend => (
              <div key={friend._id || friend.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <div className="flex items-center">
                  <img 
                    src={friend.profilePicture ? resolveMediaUrl(friend.profilePicture) : 'https://via.placeholder.com/40'} 
                    alt={friend.firstName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-50"
                  />
                  <span className="ml-3 font-semibold text-slate-700">{friend.firstName} {friend.lastName}</span>
                </div>
                
                <button
                  onClick={() => handleShare(friend._id || friend.id)}
                  disabled={sentTo[friend._id || friend.id]}
                  className={`btn px-4 py-2 flex items-center gap-2 ${
                    sentTo[friend._id || friend.id] 
                      ? 'bg-green-50 text-green-600 cursor-default' 
                      : 'bg-brand-500 text-white hover:bg-brand-600 active:scale-95'
                  }`}
                >
                  {sentTo[friend._id || friend.id] ? (
                    <>
                      <Check size={16} /> Sent
                    </>
                  ) : (
                    <>
                      <Send size={16} /> Send
                    </>
                  )}
                </button>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500 font-medium">
              You need to add friends before you can share reels!
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default ShareReelModal;

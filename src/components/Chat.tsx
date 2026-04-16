import React, { useState, useEffect, useRef } from 'react';
import { Image, Send, X } from 'lucide-react';
import { resolveMediaUrl } from '../utils/media';

interface ChatProps {
  recipientId: string;
  recipientName: string;
  recipientImage: string;
  onClose: () => void;
  socket: any;
  userId: string;
}

const Chat: React.FC<ChatProps> = ({ 
  recipientId, 
  recipientName, 
  recipientImage, 
  onClose, 
  socket, 
  userId 
}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [media, setMedia] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMessages();
    markMessagesAsRead();
    
    socket.on('message', handleNewMessage);
    socket.on('typing', handleTypingStatus);
    
    return () => {
      socket.off('message', handleNewMessage);
      socket.off('typing', handleTypingStatus);
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/messages/${userId}/${recipientId}`, {
        headers: {
          'userId': userId
        }
      });
      
      const data = await response.json();
      setMessages(data);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      await fetch(`http://localhost:5000/api/messages/read/${userId}/${recipientId}`, {
        method: 'PUT',
        headers: {
          'userId': userId
        }
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleNewMessage = (message: any) => {
    if (message.sender._id === recipientId || message.sender._id === userId) {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
      
      if (message.sender._id === recipientId) {
        markMessagesAsRead();
      }
    }
  };

  const handleTypingStatus = (data: any) => {
    if (data.senderId === recipientId) {
      setIsTyping(data.isTyping);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendTypingStatus = (isTyping: boolean) => {
    socket.emit('typing', {
      senderId: userId,
      recipientId,
      isTyping
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // Handle typing status
    sendTypingStatus(true);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(false);
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() && media.length === 0) return;
    
    try {
      const formData = new FormData();
      formData.append('recipientId', recipientId);
      formData.append('content', newMessage);
      media.forEach((f) => formData.append('media', f));

      const response = await fetch(`http://localhost:5000/api/messages/${userId}`, {
        method: 'POST',
        headers: {
          'userId': userId
        },
        body: formData
      });
      
      const message = await response.json();
      
      // Emit message through socket
      socket.emit('message', {
        ...message,
        recipientId
      });
      
      setMessages(prev => [...prev, message]);
      scrollToBottom();
      
      setNewMessage('');
      mediaPreviews.forEach((url) => URL.revokeObjectURL(url));
      setMedia([]);
      setMediaPreviews([]);
      sendTypingStatus(false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const onPickMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const next = [...media, ...files].slice(0, 6);
    // revoke old previews before rebuilding
    mediaPreviews.forEach((url) => URL.revokeObjectURL(url));
    setMedia(next);
    setMediaPreviews(next.map((f) => URL.createObjectURL(f)));
    e.target.value = '';
  };

  const removeMediaAt = (idx: number) => {
    const url = mediaPreviews[idx];
    if (url) URL.revokeObjectURL(url);
    const nextMedia = media.filter((_, i) => i !== idx);
    const nextPreviews = mediaPreviews.filter((_, i) => i !== idx);
    setMedia(nextMedia);
    setMediaPreviews(nextPreviews);
  };

  return (
    <div className="fixed bottom-0 right-6 w-80 glass-panel rounded-t-2xl shadow-lift border-t border-l border-r border-slate-200/50 animate-fade-up z-50 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-4 bg-white/40 backdrop-blur-md border-b border-slate-200/50">
        <div className="flex items-center">
          <div className="relative">
            <img 
              src={recipientImage ? resolveMediaUrl(recipientImage) : 'https://via.placeholder.com/40'} 
              alt={recipientName}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <span className="font-bold text-slate-800 ml-3 drop-shadow-sm">{recipientName}</span>
        </div>
        <button 
          className="p-1.5 rounded-full hover:bg-slate-200/50 text-slate-500 transition-colors active:scale-95"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="h-96 overflow-y-auto p-4 space-y-4 bg-slate-50/30 no-scrollbar">
        {messages.map((message, index) => (
          <div 
            key={index}
            className={`flex ${message.sender._id === userId ? 'justify-end' : 'justify-start'} animate-fade-up`}
          >
            <div 
              className={`px-4 py-2.5 max-w-[75%] shadow-sm ${
                message.sender._id === userId 
                  ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-2xl rounded-tr-sm' 
                  : 'bg-white border border-slate-100 text-slate-800 rounded-2xl rounded-tl-sm'
              }`}
            >
              <p className="text-[15px] leading-relaxed">{message.content}</p>

              {Array.isArray(message.attachments) && message.attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {message.attachments.map((url: string, i: number) => {
                    const src = resolveMediaUrl(url);
                    const isVideo = /\.(mp4|webm|ogg)(\?|#|$)/i.test(url) || url.includes('/uploads/') && /\.(mp4|webm|ogg)$/i.test(url);
                    return (
                      <div key={i} className="rounded-lg overflow-hidden bg-black/10">
                        {isVideo ? (
                          <video src={src} className="w-full max-h-48 object-contain" controls playsInline preload="metadata" />
                        ) : (
                          <img src={src} className="w-full max-h-48 object-cover" alt="attachment" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-fade-up">
            <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center space-x-1.5">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-px w-full block" />
      </div>
      
      <form onSubmit={handleSubmit} className="p-3 bg-white/70 backdrop-blur-md border-t border-slate-200/50">
        {mediaPreviews.length > 0 && (
          <div className="mb-2 flex gap-2 overflow-x-auto">
            {mediaPreviews.map((url, idx) => (
              <div key={url} className="relative h-14 w-14 shrink-0 rounded-md overflow-hidden bg-gray-100">
                {/* quick preview */}
                {media[idx]?.type?.startsWith('video/') ? (
                  <video src={url} className="h-full w-full object-cover" muted />
                ) : (
                  <img src={url} className="h-full w-full object-cover" alt="preview" />
                )}
                <button
                  type="button"
                  onClick={() => removeMediaAt(idx)}
                  className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full w-5 h-5 flex items-center justify-center"
                  aria-label="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 mt-1">
          <button
            type="button"
            className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-full transition-colors active:scale-95"
            onClick={() => fileInputRef.current?.click()}
            title="Attach photo/video"
          >
            <Image size={22} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={onPickMedia}
          />
          <input
            type="text"
            className="flex-1 bg-slate-100 border-none rounded-full px-4 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-200 focus:bg-white transition-colors"
            placeholder="Type a message..."
            value={newMessage}
            onChange={handleInputChange}
          />
          <button 
            type="submit"
            className="p-2.5 bg-brand-600 text-white rounded-full hover:bg-brand-700 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-sm"
            disabled={!newMessage.trim() && media.length === 0}
          >
            <Send size={18} className="ml-0.5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import CommentSection from './CommentSection';
import { resolveMediaUrl } from '../utils/media';

interface PostProps {
  post: any;
  onPostUpdated: () => void;
}

const Post: React.FC<PostProps> = ({ post, onPostUpdated }) => {
  const { user } = useContext(AuthContext);
  const [showComments, setShowComments] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isLiking, setIsLiking] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    
    try {
      await fetch(`http://localhost:5000/api/posts/${post._id}/like/${user?._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'userId': user?._id || ''
        }
      });
      
      onPostUpdated();
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await fetch(`http://localhost:5000/api/posts/${post._id}/${user?._id}`, {
        method: 'DELETE',
        headers: {
          'userId': user?._id || ''
        }
      });
      
      onPostUpdated();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleUpdate = async () => {
    if (!editContent.trim()) return;
    
    try {
      await fetch(`http://localhost:5000/api/posts/${post._id}/${user?._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'userId': user?._id || ''
        },
        body: JSON.stringify({ content: editContent })
      });
      
      setIsEditing(false);
      onPostUpdated();
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const isLiked = post.likes.some((id: string) => id === user?._id);
  const isOwnPost = post.user._id === user?._id;

  return (
    <div className="card card-hover animate-fade-up mb-6 overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <Link to={`/profile/${post.user._id}`} className="flex items-center">
            <img 
              src={post.user.profilePicture ? resolveMediaUrl(post.user.profilePicture) : 'https://via.placeholder.com/40'} 
              alt={`${post.user.firstName} ${post.user.lastName}`}
              className="w-11 h-11 rounded-full mr-3 object-cover ring-2 ring-brand-50"
            />
            <div>
              <p className="font-semibold text-slate-800 hover:text-brand-600 transition-colors">{post.user.firstName} {post.user.lastName}</p>
              <p className="text-slate-500 text-xs font-medium mt-0.5">{formatDate(post.createdAt)}</p>
            </div>
          </Link>
          
          {isOwnPost && (
            <div className="relative">
              <button 
                className="p-2 rounded-full hover:bg-gray-100"
                onClick={() => setShowOptions(!showOptions)}
              >
                <MoreHorizontal size={20} />
              </button>
              
              {showOptions && (
                <div className="absolute right-0 mt-1 bg-white rounded-md shadow-lg z-10 w-36">
                  <button 
                    className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-100"
                    onClick={() => {
                      setIsEditing(true);
                      setShowOptions(false);
                    }}
                  >
                    <Edit size={16} className="mr-2" />
                    <span>Edit</span>
                  </button>
                  <button 
                    className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 text-red-600"
                    onClick={() => {
                      handleDelete();
                      setShowOptions(false);
                    }}
                  >
                    <Trash2 size={16} className="mr-2" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {isEditing ? (
          <div className="mb-3">
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button 
                className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(post.content);
                }}
              >
                Cancel
              </button>
              <button 
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={handleUpdate}
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="mb-4 text-slate-800 leading-relaxed text-[15px]">{post.content}</p>
        )}
        
        {post.images && post.images.length > 0 && (
          <div className={`grid ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-2 mb-3`}>
            {post.images.map((image: string, index: number) => (
              <img 
                key={index}
                src={resolveMediaUrl(image)}
                alt={`Post image ${index + 1}`}
                className="w-full rounded-lg object-cover"
                style={{ maxHeight: '300px' }}
              />
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between text-slate-500 text-sm font-medium border-b border-slate-100 pb-3 mb-2">
          <div className="flex items-center">
            <span>{post.likes.length} likes</span>
          </div>
          <div className="flex items-center">
            <span>{post.comments.length} comments</span>
          </div>
        </div>
        
        <div className="flex justify-between gap-1 mt-2">
          <button 
            className={`flex items-center justify-center w-1/3 py-2.5 rounded-xl transition-all duration-200 hover:bg-slate-100 ${isLiked ? 'text-brand-600 font-semibold bg-brand-50/50' : 'text-slate-600 font-medium'}`}
            onClick={handleLike}
          >
            <Heart size={20} className={`mr-2 transition-transform ${isLiked ? 'fill-current scale-110' : ''}`} />
            <span>Like</span>
          </button>
          <button 
            className="flex items-center justify-center w-1/3 py-2.5 rounded-xl transition-all duration-200 hover:bg-slate-100 text-slate-600 font-medium"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle size={20} className="mr-2" />
            <span>Comment</span>
          </button>
          <button className="flex items-center justify-center w-1/3 py-2.5 rounded-xl transition-all duration-200 hover:bg-slate-100 text-slate-600 font-medium">
            <Share2 size={20} className="mr-2" />
            <span>Share</span>
          </button>
        </div>
      </div>
      
      {showComments && (
        <CommentSection 
          postId={post._id} 
          comments={post.comments}
          onCommentAdded={onPostUpdated}
        />
      )}
    </div>
  );
};

export default Post;
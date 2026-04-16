import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { resolveMediaUrl } from '../utils/media';

interface CommentSectionProps {
  postId: string;
  reelId?: string;
  comments: any[];
  onCommentAdded: () => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, reelId, comments, onCommentAdded }) => {
  const { user } = useContext(AuthContext);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showOptionsForComment, setShowOptionsForComment] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    try {
      if (reelId) {
        await fetch(`/api/reels/${reelId}/comment/${user?._id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'userId': user?._id || ''
          },
          body: JSON.stringify({ content: newComment })
        });
      } else {
        await fetch(`/api/comments/${postId}/${user?._id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'userId': user?._id || ''
          },
          body: JSON.stringify({ content: newComment })
        });
      }
      
      setNewComment('');
      onCommentAdded();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editContent.trim()) return;
    
    try {
      await fetch(`/api/comments/${commentId}/${user?._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'userId': user?._id || ''
        },
        body: JSON.stringify({ content: editContent })
      });
      
      setEditingCommentId(null);
      onCommentAdded();
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      await fetch(`/api/comments/${commentId}/${user?._id}`, {
        method: 'DELETE',
        headers: {
          'userId': user?._id || ''
        }
      });
      
      onCommentAdded();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      await fetch(`/api/comments/${commentId}/like/${user?._id}`, {
        method: 'POST',
        headers: {
          'userId': user?._id || ''
        }
      });
      
      onCommentAdded();
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  return (
    <div className="px-4 pb-4">
      <div className="mb-4">
        {comments.map((comment: any) => {
          const likes = Array.isArray(comment.likes) ? comment.likes : [];
          const isOwnComment = comment.user?._id === user?._id;
          const isLiked = likes.some((id: string) => id === user?._id);
          const created = comment.createdAt || comment.created_at || comment.created_at?.toString?.();
          
          return (
            <div key={comment._id} className="mb-3">
              <div className="flex">
                <img 
                  src={comment.user.profilePicture ? resolveMediaUrl(comment.user.profilePicture) : 'https://via.placeholder.com/40'} 
                  alt={`${comment.user.firstName} ${comment.user.lastName}`}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-lg px-3 py-2 relative">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sm">{comment.user.firstName} {comment.user.lastName}</p>
                        
                        {editingCommentId === comment._id ? (
                          <div className="mt-1">
                            <textarea
                              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={2}
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                            />
                            <div className="flex justify-end space-x-2 mt-1">
                              <button 
                                className="px-2 py-1 text-xs bg-gray-200 rounded-md hover:bg-gray-300"
                                onClick={() => {
                                  setEditingCommentId(null);
                                  setEditContent('');
                                }}
                              >
                                Cancel
                              </button>
                              <button 
                                className="px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                onClick={() => handleUpdateComment(comment._id)}
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm">{comment.content}</p>
                        )}
                      </div>
                      
                      {isOwnComment && !editingCommentId && (
                        <div className="relative">
                          <button 
                            className="p-1 rounded-full hover:bg-gray-200"
                            onClick={() => setShowOptionsForComment(showOptionsForComment === comment._id ? null : comment._id)}
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          
                          {showOptionsForComment === comment._id && (
                            <div className="absolute right-0 mt-1 bg-white rounded-md shadow-lg z-10 w-28">
                              <button 
                                className="flex items-center w-full px-3 py-1 text-xs text-left hover:bg-gray-100"
                                onClick={() => {
                                  setEditingCommentId(comment._id);
                                  setEditContent(comment.content);
                                  setShowOptionsForComment(null);
                                }}
                              >
                                <Edit size={12} className="mr-1" />
                                <span>Edit</span>
                              </button>
                              <button 
                                className="flex items-center w-full px-3 py-1 text-xs text-left hover:bg-gray-100 text-red-600"
                                onClick={() => {
                                  handleDeleteComment(comment._id);
                                  setShowOptionsForComment(null);
                                }}
                              >
                                <Trash2 size={12} className="mr-1" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center mt-1 ml-1 text-xs text-gray-500">
                    <button 
                      className={`mr-3 ${isLiked ? 'text-blue-600 font-medium' : ''}`}
                      onClick={() => handleLikeComment(comment._id)}
                    >
                      Like
                    </button>
                    <span className="mr-3">{likes.length} likes</span>
                    <span>{created ? formatDate(created) : ''}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <form onSubmit={handleAddComment} className="flex items-center">
        <img 
          src={user?.profilePicture ? resolveMediaUrl(user.profilePicture) : 'https://via.placeholder.com/40'} 
          alt="Profile" 
          className="w-8 h-8 rounded-full mr-2"
        />
        <input
          type="text"
          placeholder="Write a comment..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button 
          type="submit"
          className="ml-2 px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          disabled={!newComment.trim()}
        >
          Post
        </button>
      </form>
    </div>
  );
};

export default CommentSection;
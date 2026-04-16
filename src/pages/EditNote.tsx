import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { Music, X, ArrowLeft } from 'lucide-react';

const EditNote: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [music, setMusic] = useState<File | null>(null);
  const [musicName, setMusicName] = useState('');
  const [currentMusic, setCurrentMusic] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && id) {
      fetchNote();
    }
  }, [user, id]);

  const fetchNote = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/notes/${id}/${user?._id}`, {
        headers: {
          'userId': user?._id || ''
        }
      });
      
      if (!response.ok) {
        throw new Error('Note not found or you do not have permission to edit it');
      }
      
      const data = await response.json();
      
      // Check if user is the owner
      if (data.user._id !== user?._id) {
        navigate(`/notes/${id}`);
        return;
      }
      
      setTitle(data.title);
      setContent(data.content);
      setIsPublic(data.isPublic);
      
      if (data.music) {
        setCurrentMusic(data.music);
      }
    } catch (error) {
      console.error('Error fetching note:', error);
      navigate('/notes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMusicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMusic(file);
      setMusicName(file.name);
      setCurrentMusic(null);
    }
  };

  const removeMusic = () => {
    setMusic(null);
    setMusicName('');
    setCurrentMusic(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('isPublic', String(isPublic));
      
      if (music) {
        formData.append('music', music);
      }
      
      const response = await fetch(`http://localhost:5000/api/notes/${id}/${user?._id}`, {
        method: 'PUT',
        body: formData,
        headers: {
          'userId': user?._id || ''
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to update note');
      }
      
      navigate(`/notes/${id}`);
    } catch (error) {
      console.error('Error updating note:', error);
      setError('Failed to update note. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-6 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Link to={`/notes/${id}`} className="flex items-center text-blue-600 hover:underline">
            <ArrowLeft size={16} className="mr-1" />
            <span>Back to Note</span>
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">Edit Note</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-gray-700 font-medium mb-2">Title</label>
              <input
                type="text"
                id="title"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="content" className="block text-gray-700 font-medium mb-2">Content</label>
              <textarea
                id="content"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={10}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-blue-600"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                <span className="ml-2 text-gray-700">Make this note public</span>
              </label>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Music</label>
              
              {music ? (
                <div className="flex items-center p-3 bg-gray-100 rounded-lg">
                  <Music size={20} className="text-blue-600 mr-2" />
                  <span className="flex-1 truncate">{musicName}</span>
                  <button 
                    type="button"
                    className="p-1 rounded-full hover:bg-gray-200"
                    onClick={removeMusic}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : currentMusic ? (
                <div className="flex items-center p-3 bg-gray-100 rounded-lg">
                  <Music size={20} className="text-blue-600 mr-2" />
                  <span className="flex-1 truncate">Current music file</span>
                  <button 
                    type="button"
                    className="p-1 rounded-full hover:bg-gray-200"
                    onClick={removeMusic}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center">
                  <label className="flex items-center px-4 py-2 bg-gray-200 rounded-md cursor-pointer hover:bg-gray-300">
                    <Music size={16} className="mr-2" />
                    <span>Select Music File</span>
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={handleMusicChange}
                    />
                  </label>
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <Link 
                to={`/notes/${id}`}
                className="px-4 py-2 bg-gray-200 rounded-md mr-2 hover:bg-gray-300"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditNote;
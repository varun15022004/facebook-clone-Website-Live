import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { Music, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { resolveMediaUrl } from '../utils/media';

const NoteView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [note, setNote] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

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
        throw new Error('Note not found or you do not have permission to view it');
      }
      
      const data = await response.json();
      setNote(data);
    } catch (error) {
      console.error('Error fetching note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await fetch(`http://localhost:5000/api/notes/${id}/${user?._id}`, {
        method: 'DELETE',
        headers: {
          'userId': user?._id || ''
        }
      });
      
      navigate('/notes');
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (!note) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">Note not found or you do not have permission to view it.</p>
            <Link 
              to="/notes"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Notes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = note.user._id === user?._id;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Link to="/notes" className="flex items-center text-blue-600 hover:underline">
            <ArrowLeft size={16} className="mr-1" />
            <span>Back to Notes</span>
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">{note.title}</h1>
              <div className="flex items-center text-gray-600 mb-4">
                <Link to={`/profile/${note.user._id}`} className="flex items-center mr-4">
                  <img 
                    src={note.user.profilePicture ? resolveMediaUrl(note.user.profilePicture) : 'https://via.placeholder.com/40'} 
                    alt={`${note.user.firstName} ${note.user.lastName}`}
                    className="w-10 h-10 rounded-full mr-3 border-2 border-white"
                  />
                  <span>{note.user.firstName} {note.user.lastName}</span>
                </Link>
                <span className="text-sm">{formatDate(note.createdAt)}</span>
              </div>
            </div>
            
            {isOwner && (
              <div className="flex space-x-2">
                <Link 
                  to={`/notes/edit/${note._id}`}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                >
                  <Edit size={20} />
                </Link>
                <button 
                  className="p-2 rounded-full hover:bg-gray-100 text-red-600"
                  onClick={handleDeleteNote}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            )}
          </div>
          
          <div className="prose max-w-none mb-6">
            <div className="whitespace-pre-wrap">{note.content}</div>
          </div>
          
          {note.music && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-2">
                <Music size={20} className="text-blue-600 mr-2" />
                <h3 className="font-semibold">Attached Music</h3>
              </div>
              
              <audio 
                ref={audioRef}
                src={`http://localhost:5000${note.music}`}
                className="w-full"
                controls
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              
              <button 
                className={`mt-2 px-4 py-2 rounded-md ${isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                onClick={togglePlayPause}
              >
                {isPlaying ? 'Pause' : 'Play'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteView;
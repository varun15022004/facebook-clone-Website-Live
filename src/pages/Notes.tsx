import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import NoteCard from '../components/NoteCard';
import { Plus, BookOpen } from 'lucide-react';

const Notes: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [userNotes, setUserNotes] = useState<any[]>([]);
  const [publicNotes, setPublicNotes] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'my' | 'public'>('my');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserNotes();
      fetchPublicNotes();
    }
  }, [user]);

  const fetchUserNotes = async () => {
    try {
      const response = await fetch(`/api/notes/user/${user?._id}`, {
        headers: {
          'userId': user?._id || ''
        }
      });
      
      const data = await response.json();
      setUserNotes(data);
    } catch (error) {
      console.error('Error fetching user notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPublicNotes = async () => {
    try {
      const response = await fetch('/api/notes/public', {
        headers: {
          'userId': user?._id || ''
        }
      });
      
      const data = await response.json();
      setPublicNotes(data);
    } catch (error) {
      console.error('Error fetching public notes:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await fetch(`/api/notes/${noteId}/${user?._id}`, {
        method: 'DELETE',
        headers: {
          'userId': user?._id || ''
        }
      });
      
      // Update notes list
      setUserNotes(userNotes.filter(note => note._id !== noteId));
      setPublicNotes(publicNotes.filter(note => note._id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Notes</h1>
          
          <Link 
            to="/notes/create"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus size={16} className="mr-2" />
            <span>Create Note</span>
          </Link>
        </div>
        
        <div className="mb-6">
          <div className="flex border-b border-gray-200">
            <button 
              className={`px-4 py-2 font-medium ${activeTab === 'my' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => setActiveTab('my')}
            >
              My Notes
            </button>
            <button 
              className={`px-4 py-2 font-medium ${activeTab === 'public' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => setActiveTab('public')}
            >
              Public Notes
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {activeTab === 'my' && (
              <>
                {userNotes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userNotes.map(note => (
                      <NoteCard 
                        key={note._id} 
                        note={note} 
                        isOwner={true}
                        onDelete={handleDeleteNote}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">You haven't created any notes yet.</p>
                    <Link 
                      to="/notes/create"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Create Your First Note
                    </Link>
                  </div>
                )}
              </>
            )}
            
            {activeTab === 'public' && (
              <>
                {publicNotes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {publicNotes.map(note => (
                      <NoteCard 
                        key={note._id} 
                        note={note} 
                        isOwner={note.user._id === user?._id}
                        onDelete={handleDeleteNote}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No public notes available.</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Notes;
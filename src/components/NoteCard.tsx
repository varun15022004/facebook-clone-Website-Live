import React from 'react';
import { Link } from 'react-router-dom';
import { Music, Edit, Trash2 } from 'lucide-react';
import { resolveMediaUrl } from '../utils/media';

interface NoteCardProps {
  note: any;
  isOwner: boolean;
  onDelete: (noteId: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, isOwner, onDelete }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="card card-hover mb-5 animate-fade-up overflow-hidden group">
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <Link to={`/profile/${note.user._id}`} className="flex items-center group/user">
            <img 
              src={note.user.profilePicture ? resolveMediaUrl(note.user.profilePicture) : 'https://via.placeholder.com/40'} 
              alt={`${note.user.firstName} ${note.user.lastName}`}
              className="w-9 h-9 rounded-full mr-3 object-cover ring-2 ring-brand-50"
            />
            <span className="text-sm font-semibold text-slate-700 group-hover/user:text-brand-600 transition-colors">{note.user.firstName} {note.user.lastName}</span>
          </Link>
          <span className="text-xs font-medium text-slate-400">{formatDate(note.createdAt)}</span>
        </div>
        
        <Link to={`/notes/${note._id}`} className="block mt-2">
          <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-brand-600 transition-colors">{note.title}</h3>
          <p className="text-slate-600 mb-4 line-clamp-3 text-[15px] leading-relaxed">{note.content}</p>
        </Link>
        
        <div className="flex items-center justify-between">
          {note.music && (
            <div className="flex items-center text-gray-600">
              <Music size={16} className="mr-1" />
              <span className="text-sm">Has music</span>
            </div>
          )}
          
          {isOwner && (
            <div className="flex space-x-1">
              <Link 
                to={`/notes/edit/${note._id}`}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-brand-600 transition-colors active:scale-95"
              >
                <Edit size={18} />
              </Link>
              <button 
                className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-500 transition-colors active:scale-95"
                onClick={() => onDelete(note._id)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
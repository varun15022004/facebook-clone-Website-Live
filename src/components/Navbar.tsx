import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Bell, Home, Users, Film, BookOpen, LogOut, Search, Menu, X } from 'lucide-react';
import { resolveMediaUrl } from '../utils/media';

const Navbar: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    // Fetch notification count
    if (user) {
      fetch(`/api/notifications/${user._id}`, {
        headers: {
          'userId': user._id
        }
      })
        .then(res => res.json())
        .then(data => {
          const unreadCount = data.filter((notification: any) => !notification.read).length;
          setNotificationCount(unreadCount);
        })
        .catch(err => console.error('Error fetching notifications:', err));
    }
  }, [user]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    try {
      const response = await fetch(`/api/users/search?query=${searchQuery}`, {
        headers: {
          'userId': user?._id || ''
        }
      });
      
      const data = await response.json();
      setSearchResults(data);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUserClick = (userId: string) => {
    setShowSearchResults(false);
    setSearchQuery('');
    navigate(`/profile/${userId}`);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 text-slate-800 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-tr from-brand-600 to-brand-400 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform duration-300">
                f
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-700 to-brand-500 hidden sm:block">Clone</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center">
            <form onSubmit={handleSearch} className="relative mx-4">
              <div className="flex items-center bg-slate-100/80 hover:bg-slate-200/80 transition-colors rounded-full px-4 py-2 border border-slate-200/50 shadow-inner">
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent border-none focus:outline-none text-slate-700 placeholder-slate-400 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                />
                <button type="submit" className="hover:scale-110 transition-transform">
                  <Search size={18} className="text-slate-400 hover:text-brand-500" />
                </button>
              </div>
              
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg z-10">
                  <ul>
                    {searchResults.map(user => (
                      <li 
                        key={user._id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                        onClick={() => handleUserClick(user._id)}
                      >
                        <img 
                          src={user.profilePicture ? resolveMediaUrl(user.profilePicture) : 'https://via.placeholder.com/40'} 
                          alt={`${user.firstName} ${user.lastName}`}
                          className="w-8 h-8 rounded-full mr-2"
                        />
                        <span className="text-gray-800">{user.firstName} {user.lastName}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </form>
          </div>
          
          <div className="hidden md:flex items-center space-x-2">
            <Link to="/" className="p-2.5 rounded-xl hover:bg-slate-100 hover:text-brand-600 text-slate-600 transition-all hover:-translate-y-0.5 active:scale-95">
              <Home size={24} />
            </Link>
            <Link to="/friends" className="p-2.5 rounded-xl hover:bg-slate-100 hover:text-brand-600 text-slate-600 transition-all hover:-translate-y-0.5 active:scale-95">
              <Users size={24} />
            </Link>
            <Link to="/reels" className="p-2.5 rounded-xl hover:bg-slate-100 hover:text-brand-600 text-slate-600 transition-all hover:-translate-y-0.5 active:scale-95">
              <Film size={24} />
            </Link>
            <Link to="/notes" className="p-2.5 rounded-xl hover:bg-slate-100 hover:text-brand-600 text-slate-600 transition-all hover:-translate-y-0.5 active:scale-95">
              <BookOpen size={24} />
            </Link>
            <Link to="/notifications" className="p-2.5 rounded-xl hover:bg-slate-100 hover:text-brand-600 text-slate-600 transition-all hover:-translate-y-0.5 active:scale-95 relative">
              <Bell size={24} />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-white">
                  {notificationCount}
                </span>
              )}
            </Link>
            <Link to="/profile" className="flex items-center ml-2 p-1 hover:bg-slate-100 rounded-full transition-all hover:scale-105 active:scale-95 border-2 border-transparent hover:border-brand-200">
              <img 
                src={user?.profilePicture ? resolveMediaUrl(user.profilePicture) : 'https://via.placeholder.com/40'} 
                alt="Profile" 
                className="w-9 h-9 rounded-full object-cover"
              />
            </Link>
            <button 
              onClick={handleLogout}
              className="p-2.5 ml-2 rounded-xl hover:bg-red-50 hover:text-red-600 text-slate-600 transition-all hover:-translate-y-0.5 active:scale-95"
            >
              <LogOut size={22} />
            </button>
          </div>
          
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-full hover:bg-blue-500"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-3xl border-b border-slate-200/50 shadow-lg absolute w-full left-0">
          <div className="px-4 py-4 space-y-2">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="flex items-center bg-slate-100 rounded-2xl px-4 py-2.5 border border-slate-200">
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit">
                  <Search size={18} className="text-slate-400 hover:text-brand-500" />
                </button>
              </div>
            </form>
            
            <Link 
              to="/" 
              className="flex items-center text-slate-700 hover:bg-brand-50 hover:text-brand-600 px-4 py-3 rounded-xl transition-colors font-medium cursor-pointer"
              onClick={() => setIsMenuOpen(false)}
            >
              <Home size={20} className="mr-3 text-slate-500" />
              <span>Home</span>
            </Link>
            <Link 
              to="/profile" 
              className="flex items-center text-slate-700 hover:bg-brand-50 hover:text-brand-600 px-4 py-3 rounded-xl transition-colors font-medium cursor-pointer"
              onClick={() => setIsMenuOpen(false)}
            >
              <img 
                src={user?.profilePicture ? resolveMediaUrl(user.profilePicture) : 'https://via.placeholder.com/40'} 
                alt="Profile" 
                className="w-6 h-6 rounded-full mr-3 object-cover ring-2 ring-slate-100"
              />
              <span>Profile</span>
            </Link>
            <Link 
              to="/friends" 
              className="flex items-center text-slate-700 hover:bg-brand-50 hover:text-brand-600 px-4 py-3 rounded-xl transition-colors font-medium cursor-pointer"
              onClick={() => setIsMenuOpen(false)}
            >
              <Users size={20} className="mr-3 text-slate-500" />
              <span>Friends</span>
            </Link>
            <Link 
              to="/reels" 
              className="flex items-center text-slate-700 hover:bg-brand-50 hover:text-brand-600 px-4 py-3 rounded-xl transition-colors font-medium cursor-pointer"
              onClick={() => setIsMenuOpen(false)}
            >
              <Film size={20} className="mr-3 text-slate-500" />
              <span>Reels</span>
            </Link>
            <Link 
              to="/notes" 
              className="flex items-center text-slate-700 hover:bg-brand-50 hover:text-brand-600 px-4 py-3 rounded-xl transition-colors font-medium cursor-pointer"
              onClick={() => setIsMenuOpen(false)}
            >
              <BookOpen size={20} className="mr-3 text-slate-500" />
              <span>Notes</span>
            </Link>
            <Link 
              to="/notifications" 
              className="flex items-center text-slate-700 hover:bg-brand-50 hover:text-brand-600 px-4 py-3 rounded-xl transition-colors font-medium cursor-pointer"
              onClick={() => setIsMenuOpen(false)}
            >
              <Bell size={20} className="mr-3 text-slate-500" />
              <span>Notifications</span>
              {notificationCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </Link>
            <div className="pt-2">
              <button 
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="flex items-center text-red-600 hover:bg-red-50 px-4 py-3 rounded-xl w-full text-left transition-colors font-medium cursor-pointer"
              >
                <LogOut size={20} className="mr-3" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Post from '../components/Post';
import { Camera, Edit, MapPin, Cake } from 'lucide-react';
import { resolveMediaUrl } from '../utils/media';

const Profile: React.FC = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [birthday, setBirthday] = useState('');
  const profilePictureInputRef = useRef<HTMLInputElement>(null);
  const coverPhotoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchUserPosts();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${user?._id}`, {
        headers: {
          'userId': user?._id || ''
        }
      });
      
      const userData = await response.json();
      setBio(userData.bio || '');
      setLocation(userData.location || '');
      
      if (userData.birthday) {
        const date = new Date(userData.birthday);
        setBirthday(date.toISOString().split('T')[0]);
      }
      
      // Update user context with latest data
      updateUser(userData);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/user/${user?._id}`, {
        headers: {
          'userId': user?._id || ''
        }
      });
      
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${user?._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'userId': user?._id || ''
        },
        body: JSON.stringify({
          bio,
          location,
          birthday: birthday ? new Date(birthday).toISOString() : undefined
        })
      });
      
      const updatedUser = await response.json();
      updateUser(updatedUser);
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      const formData = new FormData();
      formData.append('image', file);
      
      try {
        const response = await fetch(`http://localhost:5000/api/users/${user?._id}/profile-picture`, {
          method: 'POST',
          body: formData,
          headers: {
            'userId': user?._id || ''
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errData = await response.json();
          alert(errData.message || 'Failed to upload profile picture');
          return;
        }
        
        const updatedUser = await response.json();
        updateUser(updatedUser);
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        alert('Failed to upload profile picture. Please try again.');
      }
    }
  };

  const handleCoverPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      const formData = new FormData();
      formData.append('image', file);
      
      try {
        const response = await fetch(`http://localhost:5000/api/users/${user?._id}/cover-photo`, {
          method: 'POST',
          body: formData,
          headers: {
            'userId': user?._id || ''
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errData = await response.json();
          alert(errData.message || 'Failed to upload cover photo');
          return;
        }
        
        const updatedUser = await response.json();
        updateUser(updatedUser);
      } catch (error) {
        console.error('Error uploading cover photo:', error);
        alert('Failed to upload cover photo. Please try again.');
      }
    }
  };

  const handlePostUpdated = () => {
    fetchUserPosts();
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto">
        {/* Cover Photo */}
        <div className="relative h-72 bg-slate-300 rounded-b-3xl shadow-sm overflow-hidden">
          {user?.coverPhoto ? (
            <img 
              src={resolveMediaUrl(user.coverPhoto)} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-brand-600 via-brand-500 to-purple-600"></div>
          )}
          
          <button 
            className="absolute bottom-5 right-5 p-2.5 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all shadow-sm active:scale-95"
            onClick={() => coverPhotoInputRef.current?.click()}
          >
            <Camera size={20} />
          </button>
          <input
            type="file"
            ref={coverPhotoInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleCoverPhotoChange}
          />
        </div>
        
        {/* Profile Info */}
        <div className="relative bg-white shadow-soft rounded-3xl mx-4 -mt-10 px-8 pb-8 z-10 animate-fade-up">
          <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-24 mb-6">
            <div className="relative group/avatar cursor-pointer">
              <img 
                src={user?.profilePicture ? resolveMediaUrl(user.profilePicture) : 'https://via.placeholder.com/150'} 
                alt="Profile" 
                className="w-36 h-36 sm:w-44 sm:h-44 rounded-full border-[6px] border-white shadow-md object-cover transition-transform duration-300 group-hover/avatar:scale-[1.02]"
              />
              <button 
                className="absolute bottom-2 right-2 p-2.5 bg-slate-800 rounded-full text-white hover:bg-brand-600 transition-colors shadow-sm active:scale-95"
                onClick={() => profilePictureInputRef.current?.click()}
              >
                <Camera size={16} />
              </button>
              <input
                type="file"
                ref={profilePictureInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleProfilePictureChange}
              />
            </div>
            
            <div className="mt-4 sm:mt-0 sm:ml-8 text-center sm:text-left flex-1 pb-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">{user?.firstName} {user?.lastName}</h1>
              {!isEditingProfile && (
                <div className="mt-3">
                  {bio && <p className="text-slate-600 mb-4 text-[17px] leading-relaxed max-w-2xl">{bio}</p>}
                  
                  <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                    {location && (
                      <div className="flex items-center text-slate-500 font-medium">
                        <MapPin size={18} className="mr-1.5 text-brand-500" />
                        <span>{location}</span>
                      </div>
                    )}
                    
                    {birthday && (
                      <div className="flex items-center text-slate-500 font-medium">
                        <Cake size={18} className="mr-1.5 text-brand-500" />
                        <span>Born {formatDate(birthday)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <button 
              className="ml-auto mt-6 sm:mt-0 btn bg-slate-100 text-slate-700 hover:bg-slate-200"
              onClick={() => setIsEditingProfile(!isEditingProfile)}
            >
              <Edit size={16} className="mr-2" />
              <span>{isEditingProfile ? 'Cancel' : 'Edit Profile'}</span>
            </button>
          </div>
          
          {isEditingProfile && (
            <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100 animate-fade-up">
              <h2 className="text-xl font-bold text-slate-800 mb-5">Edit Profile</h2>
              
              <div className="mb-4">
                <label className="block text-slate-700 font-semibold mb-2 ml-1">Bio</label>
                <textarea
                  className="input resize-none"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-slate-700 font-semibold mb-2 ml-1">Location</label>
                <input
                  type="text"
                  className="input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Where do you live?"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-slate-700 font-semibold mb-2 ml-1">Birthday</label>
                <input
                  type="date"
                  className="input"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                />
              </div>
              
              <button
                className="btn btn-primary px-8"
                onClick={handleProfileUpdate}
              >
                Save Changes
              </button>
            </div>
          )}
          
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 px-2">Posts</h2>
            
            {isLoading ? (
              <div className="flex justify-center my-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
              </div>
            ) : posts.length > 0 ? (
              posts.map(post => (
                <Post key={post._id} post={post} onPostUpdated={handlePostUpdated} />
              ))
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
                <p className="text-slate-500 font-medium text-lg">No posts yet. Start sharing!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
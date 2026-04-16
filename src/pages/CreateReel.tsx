import React, { useState, useContext, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { Video, X, ArrowLeft } from 'lucide-react';

const CreateReel: React.FC = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [caption, setCaption] = useState('');
  const [video, setVideo] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (limit to 100MB)
      if (file.size > 100 * 1024 * 1024) {
        setError('Video file is too large. Maximum size is 100MB.');
        return;
      }
      
      setVideo(file);
      const url = URL.createObjectURL(file);
      setVideoPreviewUrl(url);
    }
  };

  const removeVideo = () => {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setVideo(null);
    setVideoPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!video) {
      setError('Please select a video file');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('caption', caption);
      formData.append('video', video);
      
      const response = await fetch(`http://localhost:5000/api/reels/${user?._id}`, {
        method: 'POST',
        body: formData,
        headers: {
          'userId': user?._id || ''
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to create reel');
      }
      
      navigate('/reels');
    } catch (error) {
      console.error('Error creating reel:', error);
      setError('Failed to create reel. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Link to="/reels" className="flex items-center text-blue-600 hover:underline">
            <ArrowLeft size={16} className="mr-1" />
            <span>Back to Reels</span>
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">Create Reel</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="caption" className="block text-gray-700 font-medium mb-2">Caption (optional)</label>
              <textarea
                id="caption"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption to your reel..."
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Video</label>
              
              {videoPreviewUrl ? (
                <div className="mb-4">
                  <div className="relative">
                    <video
                      ref={videoRef}
                      src={videoPreviewUrl}
                      className="w-full h-64 object-contain bg-black rounded-lg"
                      controls
                    />
                    <button 
                      type="button"
                      className="absolute top-2 right-2 p-2 rounded-full bg-black bg-opacity-70 text-white"
                      onClick={removeVideo}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Video size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">Select a video file to upload</p>
                  <label className="px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700">
                    <span>Select Video</span>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleVideoChange}
                    />
                  </label>
                  <p className="text-gray-500 text-sm mt-2">Maximum file size: 100MB</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <Link 
                to="/reels"
                className="px-4 py-2 bg-gray-200 rounded-md mr-2 hover:bg-gray-300"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={isSubmitting || !video}
              >
                {isSubmitting ? 'Uploading...' : 'Post Reel'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateReel;
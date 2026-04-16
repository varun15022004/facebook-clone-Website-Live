import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Plus, Image, X } from 'lucide-react';

const CreateStory: React.FC = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImage(null);
    setImagePreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content && !image) return;
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('content', content);
      
      if (image) {
        formData.append('image', image);
      }
      
      const response = await fetch(`http://localhost:5000/api/stories/${user?._id}`, {
        method: 'POST',
        body: formData,
        headers: {
          'userId': user?._id || ''
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to create story');
      }
      
      // Reset form and close modal
      setContent('');
      setImage(null);
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      setImagePreviewUrl(null);
      setIsOpen(false);
      
      // Navigate to stories page
      navigate('/stories');
    } catch (error) {
      console.error('Error creating story:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div 
        className="relative rounded-lg overflow-hidden h-48 shadow-md cursor-pointer bg-gray-100 flex flex-col items-center justify-center"
        onClick={() => setIsOpen(true)}
      >
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mb-2">
          <Plus size={24} className="text-white" />
        </div>
        <p className="text-sm font-medium">Create Story</p>
      </div>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-center">Create Story</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4">
              <textarea
                placeholder="What's on your mind?"
                className="w-full border border-gray-300 rounded-lg p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              
              {imagePreviewUrl ? (
                <div className="relative mb-3">
                  <img 
                    src={imagePreviewUrl} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 rounded-full p-1"
                    onClick={removeImage}
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 mb-3 cursor-pointer hover:border-blue-500">
                  <div className="text-center">
                    <Image size={24} className="mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">Add a photo to your story</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}
              
              <div className="flex justify-end space-x-2">
                <button 
                  type="button"
                  className="px-4 py-2 bg-gray-200 rounded-lg font-medium hover:bg-gray-300"
                  onClick={() => {
                    setIsOpen(false);
                    setContent('');
                    removeImage();
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                  disabled={isSubmitting || (!content && !image)}
                >
                  {isSubmitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateStory;
import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Image, Video, Music, Smile, X, Crop } from 'lucide-react';
import { resolveMediaUrl } from '../utils/media';
import ImageCropper from './ImageCropper';

interface CreatePostProps {
  onPostCreated: () => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const { user } = useContext(AuthContext);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [croppingIndex, setCroppingIndex] = useState<number | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      // Limit to 5 images
      const newImages = [...images, ...filesArray].slice(0, 5);
      setImages(newImages);
      
      // Create preview URLs
      const newImagePreviewUrls = newImages.map(file => URL.createObjectURL(file));
      setImagePreviewUrls(newImagePreviewUrls);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    
    const newImagePreviewUrls = [...imagePreviewUrls];
    URL.revokeObjectURL(newImagePreviewUrls[index]);
    newImagePreviewUrls.splice(index, 1);
    setImagePreviewUrls(newImagePreviewUrls);
  };

  const handleCropComplete = (croppedFile: File, index: number) => {
    const newImages = [...images];
    newImages[index] = croppedFile;
    setImages(newImages);

    const newImagePreviewUrls = [...imagePreviewUrls];
    URL.revokeObjectURL(newImagePreviewUrls[index]); 
    newImagePreviewUrls[index] = URL.createObjectURL(croppedFile);
    setImagePreviewUrls(newImagePreviewUrls);
    
    setCroppingIndex(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && images.length === 0) return;
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('content', content);
      
      images.forEach(image => {
        formData.append('images', image);
      });
      
      const response = await fetch(`/api/posts/${user?._id}`, {
        method: 'POST',
        body: formData,
        headers: {
          'userId': user?._id || ''
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to create post');
      }
      
      // Clear form
      setContent('');
      setImages([]);
      setImagePreviewUrls([]);
      
      // Notify parent component
      onPostCreated();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card border border-slate-200/50 p-5 mb-6 animate-fade-up">
      <div className="flex items-center mb-4">
        <img 
          src={user?.profilePicture ? resolveMediaUrl(user.profilePicture) : 'https://via.placeholder.com/40'} 
          alt="Profile" 
          className="w-11 h-11 rounded-full mr-3 object-cover ring-2 ring-brand-100"
        />
        <div className="flex-1">
          <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder={`What's on your mind, ${user?.firstName}?`}
          className="w-full bg-slate-50 border-none rounded-xl p-4 mb-3 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:bg-white transition-colors text-slate-800 placeholder-slate-400 resize-none"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        
        {imagePreviewUrls.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            {imagePreviewUrls.map((url, index) => (
              <div key={index} className="relative group/preview overflow-hidden rounded-lg">
                <img 
                  src={url} 
                  alt={`Preview ${index}`} 
                  className="w-full h-32 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    className="p-2 bg-white rounded-full hover:bg-slate-200 transition-colors shadow-sm"
                    onClick={() => setCroppingIndex(index)}
                    title="Crop Image"
                  >
                    <Crop size={18} className="text-slate-800" />
                  </button>
                  <button
                    type="button"
                    className="p-2 bg-white rounded-full hover:bg-red-50 text-red-500 transition-colors shadow-sm"
                    onClick={() => removeImage(index)}
                    title="Remove Image"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between border-t border-gray-200 pt-3">
          <label className="flex items-center cursor-pointer text-gray-600 hover:text-blue-600">
            <Image size={20} className="mr-2" />
            <span>Photo</span>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
              disabled={images.length >= 5}
            />
          </label>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || (!content.trim() && images.length === 0)}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
      
      {croppingIndex !== null && (
        <ImageCropper 
          imageSrc={imagePreviewUrls[croppingIndex]} 
          onCropComplete={(file) => handleCropComplete(file, croppingIndex)}
          onCancel={() => setCroppingIndex(null)}
        />
      )}
    </div>
  );
};

export default CreatePost;
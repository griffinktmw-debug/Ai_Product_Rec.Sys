// Image gallery component for viewing and managing uploaded product images
import React, { useState, useEffect } from 'react';
import { getUploadedImages, deleteUploadedImage } from '../utils/imageUtils';
import { Trash2, Image as ImageIcon } from 'lucide-react';

const ImageGallery = ({ onSelectImage }) => {
  const [uploadedImages, setUploadedImages] = useState([]);

  useEffect(() => {
    setUploadedImages(getUploadedImages());
  }, []);

  const handleDeleteImage = (filename) => {
    deleteUploadedImage(filename);
    setUploadedImages(getUploadedImages());
  };

  if (uploadedImages.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No uploaded images yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {uploadedImages.map((image, index) => (
        <div key={index} className="relative group">
          <img
            src={image.data}
            alt={image.originalName}
            className="w-full h-24 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onSelectImage && onSelectImage(image.data)}
          />
          <button
            onClick={() => handleDeleteImage(image.filename)}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          >
            <Trash2 className="w-3 h-3" />
          </button>
          <p className="text-xs text-gray-600 mt-1 truncate" title={image.originalName}>
            {image.originalName}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ImageGallery;

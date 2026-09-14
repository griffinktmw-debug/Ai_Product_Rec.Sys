// Image upload and management utilities with localStorage optimization
export const uploadImage = async (file) => {
  return new Promise((resolve, reject) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      reject(new Error('Please select a valid image file (JPEG, PNG, GIF, or WebP)'));
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      reject(new Error('Image size must be less than 5MB'));
      return;
    }

    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const filename = `product_${timestamp}_${randomId}.${extension}`;

    try {
      const objectUrl = URL.createObjectURL(file);
      
      const imageMetadata = {
        filename,
        originalName: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date().toISOString(),
        objectUrl: objectUrl
      };
      
      const existingImages = JSON.parse(localStorage.getItem('uploadedImages') || '[]');
      
      const existingIndex = existingImages.findIndex(img => img.originalName === file.name);
      if (existingIndex !== -1) {
        if (existingImages[existingIndex].objectUrl) {
          URL.revokeObjectURL(existingImages[existingIndex].objectUrl);
        }
        existingImages[existingIndex] = imageMetadata;
      } else {
        existingImages.push(imageMetadata);
      }
      
      localStorage.setItem('uploadedImages', JSON.stringify(existingImages));
      
      resolve({
        url: objectUrl,
        filename,
        localPath: `/uploads/products/${filename}`
      });
    } catch (error) {
      reject(new Error('Failed to process image: ' + error.message));
    }
  });
};

export const getUploadedImages = () => {
  return JSON.parse(localStorage.getItem('uploadedImages') || '[]');
};

export const deleteUploadedImage = (filename) => {
  const existingImages = JSON.parse(localStorage.getItem('uploadedImages') || '[]');
  
  const imageToDelete = existingImages.find(img => img.filename === filename);
  if (imageToDelete && imageToDelete.objectUrl) {
    URL.revokeObjectURL(imageToDelete.objectUrl);
  }
  
  const filteredImages = existingImages.filter(img => img.filename !== filename);
  localStorage.setItem('uploadedImages', JSON.stringify(filteredImages));
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  const uploadedImages = getUploadedImages();
  const image = uploadedImages.find(img => 
    img.filename === imagePath || 
    img.localPath === imagePath ||
    imagePath.includes(img.filename)
  );
  
  return image && image.objectUrl ? image.objectUrl : imagePath;
};

export const cleanupOldImages = () => {
  try {
    const uploadedImages = getUploadedImages();
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const cleanedImages = uploadedImages.filter(img => {
      const uploadDate = new Date(img.uploadDate);
      
      if (uploadDate < oneHourAgo) {
        if (img.objectUrl) {
          URL.revokeObjectURL(img.objectUrl);
        }
        return false;
      }
      return true;
    });
    
    localStorage.setItem('uploadedImages', JSON.stringify(cleanedImages));
  } catch (error) {
    // Failed to cleanup old images
  }
};

cleanupOldImages();

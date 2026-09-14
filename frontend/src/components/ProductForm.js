// Product creation and editing form with image upload functionality
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Upload, Image } from 'lucide-react';
import { uploadImage } from '../utils/imageUtils';

const ProductForm = ({ product, onSubmit, onCancel, isLoading }) => {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');

  useEffect(() => {
    if (product) {
      setIsEditing(true);
      setImagePreview(product.image_url || null);
      reset({
        name: product.name || '',
        price: product.price || '',
        category: product.category || '',
        tags: product.tags || '',
        description: product.description || '',
        image_url: product.image_url || ''
      });
    } else {
      setIsEditing(false);
      setImagePreview(null);
      setImageFile(null);
      setImageError('');
      reset({
        name: '',
        price: '',
        category: '',
        tags: '',
        description: '',
        image_url: ''
      });
    }
  }, [product, reset]);

  const handleImageFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImageError('');
    setUploadingImage(true);
    setImageFile(file);

    try {
      const result = await uploadImage(file);
      setImagePreview(result.url);
      setValue('image_url', result.url);
    } catch (error) {
      setImageError(error.message);
      setImageFile(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageUrlChange = (event) => {
    const url = event.target.value;
    if (url) {
      setImagePreview(url);
      setImageFile(null);
    } else {
      setImagePreview(null);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setValue('image_url', '');
    setImageError('');
  };

  const onFormSubmit = (data) => {

    data.price = parseFloat(data.price);
    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              {...register('name', { 
                required: 'Product name is required',
                minLength: { value: 1, message: 'Name must be at least 1 character' }
              })}
              className="input-field"
              placeholder="Enter product name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('price', { 
                  required: 'Price is required',
                  min: { value: 0.01, message: 'Price must be greater than 0' }
                })}
                className="input-field"
                placeholder="0.00"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <input
                type="text"
                {...register('category', { 
                  required: 'Category is required',
                  minLength: { value: 1, message: 'Category must be at least 1 character' }
                })}
                className="input-field"
                placeholder="e.g., Electronics, Clothing"
              />
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <input
              type="text"
              {...register('tags')}
              className="input-field"
              placeholder="e.g., wireless, bluetooth, audio (comma-separated)"
            />
            <p className="mt-1 text-xs text-gray-500">
              Separate multiple tags with commas
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows="3"
              className="input-field resize-none"
              placeholder="Describe your product..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Image
            </label>
            

            {imagePreview && (
              <div className="mb-4 relative">
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="w-full h-48 object-cover rounded-lg border"
                  onError={() => setImageError('Failed to load image')}
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

        
            <div className="space-y-3">
  
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Upload Image File
                </label>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors">
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingImage ? 'Uploading...' : 'Choose File'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                  {imageFile && (
                    <span className="text-sm text-gray-600">
                      {imageFile.name}
                    </span>
                  )}
                </div>
              </div>

   
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Or Enter Image URL
                </label>
                <input
                  type="url"
                  {...register('image_url')}
                  onChange={handleImageUrlChange}
                  className="input-field"
                  placeholder="https://example.com/image.jpg"
                  disabled={uploadingImage}
                />
              </div>
            </div>

   
            {imageError && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <Image className="w-4 h-4 mr-1" />
                {imageError}
              </p>
            )}

            <p className="mt-2 text-xs text-gray-500">
              Upload an image file (JPEG, PNG, GIF, WebP) or provide a URL. Max file size: 5MB.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;

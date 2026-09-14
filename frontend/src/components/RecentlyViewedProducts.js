// Recently viewed products component with horizontal scrolling and management features
import React, { useState, useEffect, useCallback } from 'react';
import { Clock, X, Eye } from 'lucide-react';
import recentlyViewedService from '../services/recentlyViewedService';
import productService from '../services/api';

const RecentlyViewedProducts = ({ onProductSelect, products = [], className = '' }) => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadRecentlyViewed = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const productIds = recentlyViewedService.getRecentlyViewedIds();
      
      if (productIds.length === 0) {
        setRecentlyViewed([]);
        setLoading(false);
        return;
      }


      try {
        const response = await productService.getRecentlyViewedProducts(productIds, 8);
        setRecentlyViewed(response.recently_viewed || []);
      } catch (apiError) {
        console.warn('API failed, falling back to local products:', apiError);
        

        const foundProducts = productIds
          .map(id => products.find(p => p.id === id))
          .filter(product => product !== undefined); 
        
        setRecentlyViewed(foundProducts);
      }

    } catch (err) {
      console.error('Error loading recently viewed products:', err);
      setError('Failed to load recently viewed products');
    } finally {
      setLoading(false);
    }
  }, [products]);

  useEffect(() => {
    loadRecentlyViewed();
  }, [loadRecentlyViewed]);

  const handleRemoveProduct = (productId) => {
    recentlyViewedService.removeProduct(productId);
    setRecentlyViewed(prev => prev.filter(product => product.id !== productId));
  };

  const handleClearAll = () => {
    recentlyViewedService.clearAll();
    setRecentlyViewed([]);
  };

  const handleProductClick = (product) => {
    if (onProductSelect) {
      onProductSelect(product);
    }
  };

  if (error) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Recently Viewed
          </h3>
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
            {recentlyViewed.length}
          </span>
        </div>
        
        {recentlyViewed.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Clear All
          </button>
        )}
        

        {recentlyViewed.length === 0 && products.length > 0 && (
          <button
            onClick={() => {
 
              const testProductIds = products.slice(0, 3).map(p => p.id);
              testProductIds.forEach(id => recentlyViewedService.addProduct(id));
              loadRecentlyViewed();
            }}
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors px-3 py-1 border border-blue-200 rounded"
          >
            Test Feature
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}


      {!loading && recentlyViewed.length > 0 && (
        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
          {recentlyViewed.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-48 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
            >
       
              <div className="relative">
                <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <Eye className="w-8 h-8 text-gray-400" />
                </div>
                
  
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveProduct(product.id);
                  }}
                  className="absolute top-2 right-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>


              <div 
                className="p-3 cursor-pointer"
                onClick={() => handleProductClick(product)}
              >
                <h4 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">
                  {product.name}
                </h4>
                <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                  {product.category}
                </p>
                <p className="text-sm font-bold text-blue-600">
                  ${product.price?.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}


      {!loading && recentlyViewed.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-600 mb-1">No recently viewed products yet</p>
          <p className="text-xs text-gray-400">
            Click on any product to view details and it will appear here for quick access
          </p>
        </div>
      )}
    </div>
  );
};

export default RecentlyViewedProducts;
// Detailed product view with AI-powered recommendations and related products
import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Heart, Eye, Brain, Info, TrendingUp } from 'lucide-react';
import { productService } from '../services/api';
import recentlyViewedService from '../services/recentlyViewedService';

const ProductDetailView = ({ product, onBack, onProductSelect }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationData, setRecommendationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useAiRecommendations, setUseAiRecommendations] = useState(true);

  const fetchRecommendations = useCallback(async () => {
    if (!product?.id) return;
    
    setLoading(true);
    setError(null);

    try {
      const data = await productService.getProductRecommendations(
        product.id,
        6,
        useAiRecommendations
      );
      
      setRecommendationData(data);
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      setError('Failed to load recommendations');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, [product?.id, useAiRecommendations]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  useEffect(() => {
    if (product?.id) {
      recentlyViewedService.addProduct(product.id);
    
      productService.trackProductView(product.id)
        .catch(err => {
          // Failed to track on backend, but continue with frontend tracking
        });
    }
  }, [product?.id]);

  const formatTags = (tags) => {
    if (!tags) return [];
    return tags.split(',').map(tag => tag.trim()).filter(tag => tag);
  };

  if (!product) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <button
        onClick={onBack}
        className="flex items-center text-green-600 hover:text-green-700 mb-6 font-medium"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Browse
      </button>


      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
 
          <div className="aspect-w-16 aspect-h-12">
            <img
              src={product.image_url || 'https://via.placeholder.com/600x400?text=No+Image'}
              alt={product.name}
              className="w-full h-96 object-cover rounded-lg"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/600x400?text=No+Image';
              }}
            />
          </div>


          <div className="flex flex-col justify-center">
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-4">
                {product.category}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              <p className="text-gray-600 text-lg mb-6">
                {product.description}
              </p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-green-600">
                ${product.price}
              </span>
            </div>


            {product.tags && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {formatTags(product.tags).map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}


            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3 mb-2">
                <Brain className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium text-gray-900">Smart Recommendations</h3>
              </div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={useAiRecommendations}
                  onChange={(e) => setUseAiRecommendations(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Enable AI-enhanced product suggestions
                </span>
              </label>
            </div>


            <div className="flex space-x-4">
              <button className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium transition-colors">
                Add to Cart
              </button>
              <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>


      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Eye className="w-6 h-6 text-green-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">You Might Also Like</h2>
          </div>
          
 
          {recommendationData?.algorithm_info?.ai_available && useAiRecommendations && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Brain className="w-4 h-4" />
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                AI Enhanced
              </span>
            </div>
          )}
        </div>


        {error && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center">
              <Info className="w-4 h-4 text-yellow-600 mr-2" />
              <span className="text-sm text-yellow-800">{error}</span>
            </div>
          </div>
        )}


        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Finding perfect recommendations...</p>
          </div>
        )}


        {!loading && recommendations.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map(rec => (
                <div
                  key={rec.product.id}
                  onClick={() => onProductSelect(rec.product)}
                  className="bg-gray-50 rounded-lg p-6 hover:bg-white hover:shadow-md transition-all cursor-pointer border border-gray-100"
                >
   
                  <div className="mb-4">
                    <img
                      src={rec.product.image_url || 'https://via.placeholder.com/200x150?text=No+Image'}
                      alt={rec.product.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/200x150?text=No+Image';
                      }}
                    />
                    <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">{rec.product.name}</h4>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-green-600 font-bold text-lg">${rec.product.price}</p>
                      <span className="text-xs bg-white px-2 py-1 rounded text-gray-600">
                        {rec.product.category}
                      </span>
                    </div>
                  </div>
                  
    
                  <div className="mb-3">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      Recommended for you
                    </span>
                  </div>
                </div>
              ))}
            </div>

  
            <div className="text-center mt-8">
              <button
                onClick={fetchRecommendations}
                className="inline-flex items-center px-6 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 font-medium"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Refresh Recommendations
              </button>
            </div>
          </div>
        ) : !loading ? (
          <div className="text-center py-12">
            <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No recommendations available for this product</p>
            <button
              onClick={fetchRecommendations}
              className="mt-4 text-green-600 hover:text-green-700 font-medium"
            >
              Try Again
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ProductDetailView;
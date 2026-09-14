// User-facing product browsing and recommendation view with AI-powered suggestions
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Heart, Star, Eye, ArrowRight, ArrowLeft, Brain, Info, ChevronDown } from 'lucide-react';
import { productService } from '../services/api';
import RecentlyViewedProducts from './RecentlyViewedProducts';
import recentlyViewedService from '../services/recentlyViewedService';

const UserRecommendationView = ({ products, recommendationEngine, onProductSelect }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationData, setRecommendationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('browse'); 
  const [useAiRecommendations, setUseAiRecommendations] = useState(true);
  const [userSelectedCategory, setUserSelectedCategory] = useState('');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState('featured');

  const categories = ['All Categories', ...Array.from(new Set(products.map(p => p.category)))];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownOpen && !event.target.closest('.category-dropdown')) {
        setCategoryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [categoryDropdownOpen]);

  const getFilteredProducts = () => {
    let filtered = products;
    

    if (userSelectedCategory && userSelectedCategory !== 'All Categories') {
      filtered = filtered.filter(p => p.category === userSelectedCategory);
    }
    

    switch (sortBy) {
      case 'price-low':
        return [...filtered].sort((a, b) => a.price - b.price);
      case 'price-high':
        return [...filtered].sort((a, b) => b.price - a.price);
      case 'newest':
        return [...filtered].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      default:
        return filtered;
    }
  };

  const filteredProducts = getFilteredProducts();

  const handleProductClick = async (product) => {
  
    recentlyViewedService.addProduct(product.id);
    
    setSelectedProduct(product);
    setLoading(true);
    setError(null);
    setViewMode('detail');

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
      setError('Failed to load recommendations. Using fallback algorithm.');
      
 
      const fallbackRecs = recommendationEngine.getRecommendations(product, products, 6);
      setRecommendations(fallbackRecs);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToBrowse = () => {
    setViewMode('browse');
    setSelectedProduct(null);
    setRecommendations([]);
    setRecommendationData(null);
    setError(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <ShoppingCart className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Discover Amazing Products</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Browse our collection and get AI-powered personalized recommendations
        </p>
        
  
        <div className="mt-4 flex items-center justify-center space-x-3">
          <Brain className="w-5 h-5 text-blue-600" />
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={useAiRecommendations}
              onChange={(e) => setUseAiRecommendations(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Smart recommendations
            </span>
          </label>
        </div>
      </div>


      {viewMode === 'browse' && (
        <div>

          <div className="bg-white border-b border-gray-200 mb-6">
            <div className="flex items-center justify-between py-4">
   
              <div className="relative category-dropdown">
                <button
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <ChevronDown className="w-4 h-4" />
                  <span className="font-medium">
                    {userSelectedCategory || 'All Categories'}
                  </span>
                </button>
                
                {categoryDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="py-2">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            setUserSelectedCategory(category === 'All Categories' ? '' : category);
                            setCategoryDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

    
              <div className="flex items-center space-x-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>
                
                <span className="text-sm text-gray-600">
                  {filteredProducts.length} products
                </span>
              </div>
            </div>
          </div>


          <RecentlyViewedProducts 
            onProductSelect={onProductSelect || handleProductClick}
            products={products}
            className="mb-8"
          />


          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">
                {userSelectedCategory ? `${userSelectedCategory} Products` : 'Featured Products'}
              </h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </button>
            </div>
            
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    onClick={() => onProductSelect ? onProductSelect(product) : handleProductClick(product)}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  >
   
                    <div className="aspect-w-16 aspect-h-12 bg-gray-200 relative">
                      <img
                        src={product.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                        }}
                      />
                      <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                        <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                      </button>
                    </div>
                    

                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h4>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xl font-bold text-blue-600">
                          ${product.price}
                        </span>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">4.5</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {product.category}
                        </span>
                        <button className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center">
                          View
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {userSelectedCategory ? `No products found in ${userSelectedCategory}` : 'No products available. Switch to Admin View to add products.'}
                </p>
                {userSelectedCategory && (
                  <button
                    onClick={() => setUserSelectedCategory('')}
                    className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All Categories
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}


      {viewMode === 'detail' && selectedProduct && (
        <div>
  
          <button
            onClick={handleBackToBrowse}
            className="flex items-center text-green-600 hover:text-green-700 mb-6 font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Browse
          </button>

 
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">

              <div className="aspect-w-16 aspect-h-12">
                <img
                  src={selectedProduct.image_url || 'https://via.placeholder.com/600x400?text=No+Image'}
                  alt={selectedProduct.name}
                  className="w-full h-96 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/600x400?text=No+Image';
                  }}
                />
              </div>


              <div className="flex flex-col justify-center">
                <div className="mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-4">
                    {selectedProduct.category}
                  </span>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {selectedProduct.name}
                  </h1>
                  <p className="text-gray-600 text-lg mb-6">
                    {selectedProduct.description}
                  </p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-green-600">
                    ${selectedProduct.price}
                  </span>
                </div>

  
                {selectedProduct.tags && (
                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 mb-2">Tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.tags.split(',').map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}


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
                      onClick={() => onProductSelect ? onProductSelect(rec.product) : handleProductClick(rec.product)}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-white hover:shadow-md transition-all cursor-pointer border border-gray-100"
                    >
                      <div className="flex items-center space-x-4 mb-3">
                        <img
                          src={rec.product.image_url || 'https://via.placeholder.com/80x80?text=No+Image'}
                          alt={rec.product.name}
                          className="w-20 h-20 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                          }}
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">{rec.product.name}</h4>
                          <p className="text-green-600 font-bold text-lg">${rec.product.price}</p>
                          <span className="text-xs bg-white px-2 py-1 rounded text-gray-600">
                            {rec.product.category}
                          </span>
                        </div>
                      </div>
                      
        
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          Recommended for you
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : !loading ? (
              <div className="text-center py-12">
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recommendations available for this product</p>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRecommendationView;

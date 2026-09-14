// Main React application component with admin and user views for product management
import React, { useState, useEffect, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Plus, Settings, ShoppingCart, Filter } from 'lucide-react';

import ProductCard from './components/ProductCard';
import ProductForm from './components/ProductForm';
import UserRecommendationView from './components/UserRecommendationView';
import ProductDetailView from './components/ProductDetailView';
import RecommendationEngine from './utils/recommendationEngine';
import { productService } from './services/api';

function App() {
  const [products, setProducts] = useState([]);
  const [adminFilteredProducts, setAdminFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [currentView, setCurrentView] = useState('admin');
  const [selectedProductForDetail, setSelectedProductForDetail] = useState(null);
  const [recommendationEngine] = useState(new RecommendationEngine());

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
  
      const data = await productService.getProducts(0, 100, '');
      setProducts(data);
      
      filterProductsForAdmin(data, selectedCategory);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    const uniqueCategories = [...new Set(products.map(product => product.category))];
    setCategories(uniqueCategories);
  }, [products]);

  const filterProductsForAdmin = (allProducts, category = '') => {
    if (category) {
      const filtered = allProducts.filter(product => product.category === category);
      setAdminFilteredProducts(filtered);
    } else {
      setAdminFilteredProducts(allProducts);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      loadProducts();
      return;
    }

    try {
      setLoading(true);
      const data = await productService.searchProducts(query);
      setProducts(data);
      filterProductsForAdmin(data, selectedCategory);
    } catch (error) {
      console.error('Error searching products:', error);
      toast.error('Failed to search products');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    filterProductsForAdmin(products, category);
  };

  const handleCreateProduct = async (productData) => {
    try {
      await productService.createProduct(productData);
      toast.success('Product created successfully!');
      setShowForm(false);
      loadProducts();
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
    }
  };

  const handleUpdateProduct = async (productData) => {
    try {
      await productService.updateProduct(editingProduct.id, productData);
      toast.success('Product updated successfully!');
      setShowForm(false);
      setEditingProduct(null);
      loadProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await productService.deleteProduct(productId);
      toast.success('Product deleted successfully!');
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleFormSubmit = (productData) => {
    if (editingProduct) {
      handleUpdateProduct(productData);
    } else {
      handleCreateProduct(productData);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Product Recommender System</h1>
            
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setCurrentView('admin')}
                className={`flex items-center px-6 py-3 rounded-md transition-colors font-medium ${
                  currentView === 'admin'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Settings className="w-5 h-5 mr-2" />
                Admin View
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  CRUD
                </span>
              </button>
              <button
                onClick={() => setCurrentView('user')}
                className={`flex items-center px-6 py-3 rounded-md transition-colors font-medium ${
                  currentView === 'user'
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                User View
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Recommendations
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="py-8">
        {currentView === 'admin' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
                <p className="text-gray-600 mt-1">Create, edit, and manage your product catalog</p>
              </div>
              
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add New Product
                </button>
              )}
            </div>

            {showForm && (
              <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <ProductForm
                  product={editingProduct}
                  onSubmit={handleFormSubmit}
                  onCancel={handleFormCancel}
                  isLoading={loading}
                />
              </div>
            )}

            <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      handleSearch(e.target.value);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryFilter(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <Filter className="absolute right-2 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Product Catalog</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {products.length} product{products.length !== 1 ? 's' : ''} in catalog
                  {selectedCategory && ` • Category: ${selectedCategory}`}
                  {searchQuery && ` • Search: "${searchQuery}"`}
                </p>
              </div>
              
              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Loading products...</p>
                </div>
              ) : adminFilteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                  {adminFilteredProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onEdit={handleEditProduct}
                      onDelete={handleDeleteProduct}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No products found</p>
                  {(searchQuery || selectedCategory) && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('');
                        loadProducts();
                      }}
                      className="mt-2 text-blue-600 hover:text-blue-700"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'user' && (
          <UserRecommendationView
            products={products}
            recommendationEngine={recommendationEngine}
            onProductSelect={(product) => {
              setSelectedProductForDetail(product);
              setCurrentView('detail');
            }}
          />
        )}

        {currentView === 'detail' && selectedProductForDetail && (
          <ProductDetailView
            product={selectedProductForDetail}
            onBack={() => {
              setCurrentView('user');
              setSelectedProductForDetail(null);
            }}
            onProductSelect={(product) => {
              setSelectedProductForDetail(product);
            }}
          />
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              Product Recommender System - 
              <span className={`ml-2 font-medium ${
                currentView === 'admin' ? 'text-blue-600' : 
                currentView === 'detail' ? 'text-purple-600' : 'text-green-600'
              }`}>
                {currentView === 'admin' ? 'Admin Mode (Management)' : 
                 currentView === 'detail' ? 'Product Detail (AI Recommendations)' : 
                 'User Mode (Shopping)'}
              </span>
            </div>
            <div>
              {currentView === 'admin' ? adminFilteredProducts.length : products.length} products • {new Set(products.map(p => p.category)).size} categories
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

// API service for product CRUD operations and recommendations
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const productService = {
  getProducts: async (skip = 0, limit = 100, category = null) => {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });
    
    if (category) {
      params.append('category', category);
    }
    
    const response = await api.get(`/products/?${params}`);
    return response.data;
  },

  getProduct: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  createProduct: async (product) => {
    const response = await api.post('/products/', product);
    return response.data;
  },

  updateProduct: async (id, product) => {
    const response = await api.put(`/products/${id}`, product);
    return response.data;
  },

  deleteProduct: async (id) => {
    await api.delete(`/products/${id}`);
  },

  searchProducts: async (query, skip = 0, limit = 100) => {
    const params = new URLSearchParams({
      q: query,
      skip: skip.toString(),
      limit: limit.toString(),
    });
    
    const response = await api.get(`/products/search/?${params}`);
    return response.data;
  },

  getProductRecommendations: async (productId, limit = 6, useAi = true) => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      use_ai: useAi.toString(),
    });
    
    const response = await api.get(`/products/${productId}/recommendations?${params}`);
    return response.data;
  },

  getCategoryRecommendations: async (category, limit = 6, excludeId = null) => {
    const params = new URLSearchParams({
      limit: limit.toString(),
    });
    
    if (excludeId) {
      params.append('exclude_id', excludeId.toString());
    }
    
    const response = await api.get(`/products/category/${encodeURIComponent(category)}/recommendations?${params}`);
    return response.data;
  },

  getTrendingProducts: async (limit = 6) => {
    const params = new URLSearchParams({
      limit: limit.toString(),
    });
    
    const response = await api.get(`/products/trending?${params}`);
    return response.data;
  },

  getRecommendationExplanation: async () => {
    const response = await api.get('/recommendations/explain');
    return response.data;
  },

  trackProductView: async (productId, sessionId = 'default-session') => {
    const params = new URLSearchParams({
      session_id: sessionId,
    });
    
    const response = await api.post(`/products/${productId}/view?${params}`);
    return response.data;
  },

  getRecentlyViewedProducts: async (productIds, limit = 10) => {
    if (!productIds || productIds.length === 0) {
      return { recently_viewed: [], total_count: 0 };
    }
    
    const params = new URLSearchParams({
      product_ids: productIds.join(','),
      limit: limit.toString(),
    });
    
    const response = await api.get(`/products/recently-viewed?${params}`);
    return response.data;
  },
};

export default productService;

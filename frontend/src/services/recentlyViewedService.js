// Recently viewed products service using localStorage for browsing history persistence
const STORAGE_KEY = 'recently_viewed_products';
const MAX_ITEMS = 20;

class RecentlyViewedService {
  
  getRecentlyViewedIds() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading recently viewed products:', error);
      return [];
    }
  }

  addProduct(productId) {
    try {
      let recentlyViewed = this.getRecentlyViewedIds();
      
      recentlyViewed = recentlyViewed.filter(id => id !== productId);
      
      recentlyViewed.unshift(productId);
      
      if (recentlyViewed.length > MAX_ITEMS) {
        recentlyViewed = recentlyViewed.slice(0, MAX_ITEMS);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentlyViewed));
      
      return recentlyViewed;
    } catch (error) {
      console.error('Error adding product to recently viewed:', error);
      return this.getRecentlyViewedIds();
    }
  }

  removeProduct(productId) {
    try {
      let recentlyViewed = this.getRecentlyViewedIds();
      recentlyViewed = recentlyViewed.filter(id => id !== productId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentlyViewed));
      return recentlyViewed;
    } catch (error) {
      console.error('Error removing product from recently viewed:', error);
      return this.getRecentlyViewedIds();
    }
  }

  clearAll() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    } catch (error) {
      console.error('Error clearing recently viewed products:', error);
      return [];
    }
  }

  getRecentlyViewedWithLimit(limit = MAX_ITEMS) {
    const allIds = this.getRecentlyViewedIds();
    return limit ? allIds.slice(0, limit) : allIds;
  }

  hasProduct(productId) {
    const recentlyViewed = this.getRecentlyViewedIds();
    return recentlyViewed.includes(productId);
  }

  getCount() {
    return this.getRecentlyViewedIds().length;
  }
}

const recentlyViewedService = new RecentlyViewedService();
export default recentlyViewedService;
// Product recommendation engine using rule-based similarity scoring
class RecommendationEngine {
  constructor() {
    this.rules = {
      SAME_CATEGORY: 50,
      SIMILAR_PRICE: 30,
      SHARED_TAG: 10,
      PRICE_RANGE_THRESHOLD: 0.3
    };
  }

  getRecommendations(currentProduct, allProducts, limit = 4) {
    if (!currentProduct || !allProducts) return [];

    return allProducts
      .filter(product => product.id !== currentProduct.id)
      .map(product => ({
        ...product,
        score: this.calculateSimilarityScore(currentProduct, product),
        reasons: this.getSimilarityReasons(currentProduct, product)
      }))
      .filter(product => product.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  calculateSimilarityScore(product1, product2) {
    let score = 0;

    if (product1.category === product2.category) {
      score += this.rules.SAME_CATEGORY;
    }

    const priceDiff = Math.abs(product1.price - product2.price);
    const priceThreshold = product1.price * this.rules.PRICE_RANGE_THRESHOLD;
    if (priceDiff <= priceThreshold) {
      score += this.rules.SIMILAR_PRICE;
    }

    const sharedTags = this.getSharedTags(product1, product2);
    score += sharedTags.length * this.rules.SHARED_TAG;

    return score;
  }

  getSimilarityReasons(product1, product2) {
    const reasons = [];

    if (product1.category === product2.category) {
      reasons.push('Same Category');
    }

    const priceDiff = Math.abs(product1.price - product2.price);
    const priceThreshold = product1.price * this.rules.PRICE_RANGE_THRESHOLD;
    if (priceDiff <= priceThreshold) {
      reasons.push('Similar Price');
    }

    const sharedTags = this.getSharedTags(product1, product2);
    if (sharedTags.length > 0) {
      reasons.push(`Shared Tags: ${sharedTags.join(', ')}`);
    }

    return reasons;
  }

  getSharedTags(product1, product2) {
    const tags1 = this.parseTags(product1.tags);
    const tags2 = this.parseTags(product2.tags);
    
    return tags1.filter(tag => tags2.includes(tag));
  }

  parseTags(tags) {
    if (!tags) return [];
    return tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag);
  }

  getRecommendationAnalytics(products) {
    const analytics = {
      totalProducts: products.length,
      categories: new Set(products.map(p => p.category)).size,
      averagePrice: products.reduce((sum, p) => sum + p.price, 0) / products.length,
      priceRange: {
        min: Math.min(...products.map(p => p.price)),
        max: Math.max(...products.map(p => p.price))
      }
    };

    return analytics;
  }

  testAllRecommendations(products) {
    const results = products.map(product => {
      const recommendations = this.getRecommendations(product, products);
      return {
        product,
        recommendationCount: recommendations.length,
        averageScore: recommendations.length > 0 
          ? recommendations.reduce((sum, r) => sum + r.score, 0) / recommendations.length 
          : 0,
        recommendations
      };
    });

    return results;
  }
}

export default RecommendationEngine;

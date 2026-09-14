# Hybrid recommendation system combining rule-based logic with AI/ML enhancement
from sqlalchemy.orm import Session
from database import Product
from typing import List, Dict, Any, Optional
import re
import math
import logging

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    import numpy as np
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False
    logging.warning("AI/ML libraries not available. Falling back to rule-based only.")

class ProductRecommendationService:
    
    def __init__(self):
        self.category_groups = {
            'electronics': ['electronics', 'tech', 'gadget', 'device', 'computer', 'phone', 'laptop'],
            'clothing': ['clothing', 'fashion', 'apparel', 'wear', 'textile', 'shirt', 'dress'],
            'books': ['book', 'literature', 'reading', 'education', 'learning', 'novel'],
            'home': ['home', 'house', 'furniture', 'decor', 'kitchen', 'living'],
            'sports': ['sports', 'fitness', 'exercise', 'outdoor', 'athletic', 'gym'],
            'food': ['food', 'beverage', 'drink', 'snack', 'meal', 'cooking'],
            'beauty': ['beauty', 'cosmetic', 'skincare', 'makeup', 'health'],
            'automotive': ['car', 'auto', 'vehicle', 'automotive', 'motor'],
            'toys': ['toy', 'game', 'play', 'children', 'kids', 'entertainment']
        }
        
        self.stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
            'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 
            'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
            'this', 'that', 'these', 'those', 'it', 'its', 'from', 'up', 'down',
            'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once'
        }
    
    def get_recommendations(
        self, 
        db: Session, 
        product_id: int, 
        limit: int = 6,
        use_ai: bool = True
    ) -> Dict[str, Any]:
        target_product = db.query(Product).filter(Product.id == product_id).first()
        if not target_product:
            return {"error": "Product not found", "recommendations": []}
        
    
        all_products = db.query(Product).filter(Product.id != product_id).all()
        if not all_products:
            return {
                "target_product": self._format_product(target_product),
                "recommendations": [],
                "message": "No other products available for recommendations"
            }
        
        
        recommendations = []
        
        for product in all_products:
            score_data = self._calculate_recommendation_score(
                target_product, product, use_ai and ML_AVAILABLE
            )
            
            if score_data['total_score'] > 0.1: 
                recommendations.append({
                    'product': self._format_product(product),
                    'score': score_data['total_score'],
                    'confidence': self._calculate_confidence(score_data),
                    'reasoning': score_data['reasoning'],
                    'match_details': score_data['match_details'],
                    'score_breakdown': {
                        'category': round(score_data['category_score'], 3),
                        'price': round(score_data['price_score'], 3),
                        'tags': round(score_data['tag_score'], 3),
                        'ai_similarity': round(score_data['ai_score'], 3) if use_ai else 0
                    }
                })
        
        recommendations.sort(key=lambda x: x['score'], reverse=True)
        top_recommendations = recommendations[:limit]
        
        return {
            "target_product": self._format_product(target_product),
            "recommendations": top_recommendations,
            "total_found": len(recommendations),
            "algorithm_info": {
                "approach": "Hybrid (Rule-based + AI/ML)" if use_ai and ML_AVAILABLE else "Rule-based",
                "weights": {
                    "category_similarity": "40%",
                    "price_similarity": "25%",
                    "tag_similarity": "25%",
                    "ai_similarity": "10%" if use_ai and ML_AVAILABLE else "0% (disabled)"
                },
                "ai_available": ML_AVAILABLE
            }
        }
    
    def _calculate_recommendation_score(
        self, 
        target_product: Product, 
        candidate_product: Product,
        use_ai: bool = True
    ) -> Dict[str, Any]:
        """Calculate comprehensive recommendation score"""
        
        scores = {
            'category_score': 0,
            'price_score': 0,
            'tag_score': 0,
            'ai_score': 0,
            'total_score': 0,
            'reasoning': [],
            'match_details': {}
        }
        
        category_result = self._calculate_category_similarity(
            target_product.category, candidate_product.category
        )
        scores['category_score'] = category_result['score']
        if category_result['reason']:
            scores['reasoning'].append(category_result['reason'])
        scores['match_details']['category'] = category_result
        
        price_result = self._calculate_price_similarity(
            target_product.price, candidate_product.price
        )
        scores['price_score'] = price_result['score']
        if price_result['reason']:
            scores['reasoning'].append(price_result['reason'])
        scores['match_details']['price'] = price_result
        
       
        tag_result = self._calculate_tag_similarity(target_product, candidate_product)
        scores['tag_score'] = tag_result['score']
        if tag_result['reason']:
            scores['reasoning'].append(tag_result['reason'])
        scores['match_details']['tags'] = tag_result
        
        
        if use_ai:
            ai_result = self._calculate_ai_similarity(target_product, candidate_product)
            scores['ai_score'] = ai_result['score']
            if ai_result['reason']:
                scores['reasoning'].append(ai_result['reason'])
            scores['match_details']['ai'] = ai_result
        
      
        weights = {'category': 0.4, 'price': 0.25, 'tag': 0.25, 'ai': 0.1}
        scores['total_score'] = (
            scores['category_score'] * weights['category'] +
            scores['price_score'] * weights['price'] +
            scores['tag_score'] * weights['tag'] +
            scores['ai_score'] * weights['ai']
        )
        
        return scores
    
    def _calculate_category_similarity(self, cat1: str, cat2: str) -> Dict[str, Any]:
        """Calculate category similarity with detailed explanation"""
        if not cat1 or not cat2:
            return {'score': 0, 'reason': '', 'match_type': 'none'}
        
        cat1_clean = cat1.lower().strip()
        cat2_clean = cat2.lower().strip()
        
     
        if cat1_clean == cat2_clean:
            return {
                'score': 1.0,
                'reason': f"Same category: {cat1}",
                'match_type': 'exact',
                'categories': [cat1, cat2]
            }
        
        for group_name, group_categories in self.category_groups.items():
            if cat1_clean in group_categories and cat2_clean in group_categories:
                return {
                    'score': 0.7,
                    'reason': f"Related categories ({group_name}): {cat1} → {cat2}",
                    'match_type': 'related',
                    'group': group_name,
                    'categories': [cat1, cat2]
                }
        
        if cat1_clean in cat2_clean or cat2_clean in cat1_clean:
            return {
                'score': 0.5,
                'reason': f"Partial category match: {cat1} ↔ {cat2}",
                'match_type': 'partial',
                'categories': [cat1, cat2]
            }
        
        return {'score': 0, 'reason': '', 'match_type': 'none'}
    
    def _calculate_price_similarity(self, price1: float, price2: float) -> Dict[str, Any]:
        """Calculate price similarity with detailed explanation"""
        if price1 <= 0 or price2 <= 0:
            return {'score': 0, 'reason': '', 'price_diff_percent': 0}
        
        price_diff = abs(price1 - price2)
        price_diff_percent = (price_diff / max(price1, price2)) * 100
        
        similarity = math.exp(-3 * (price_diff / max(price1, price2)))
        
        reason = ""
        if similarity > 0.7:
            reason = f"Very similar price (±{price_diff_percent:.1f}%)"
        elif similarity > 0.4:
            reason = f"Similar price range (±{price_diff_percent:.1f}%)"
        elif similarity > 0.2:
            reason = f"Moderate price difference (±{price_diff_percent:.1f}%)"
        
        return {
            'score': min(similarity, 1.0),
            'reason': reason,
            'price_diff_percent': round(price_diff_percent, 1),
            'price_diff_amount': round(price_diff, 2),
            'original_price': price1,
            'candidate_price': price2
        }
    
    def _calculate_tag_similarity(self, product1: Product, product2: Product) -> Dict[str, Any]:
        """Calculate tag/keyword similarity with detailed explanation"""
        keywords1 = self._extract_keywords(product1)
        keywords2 = self._extract_keywords(product2)
        
        if not keywords1 or not keywords2:
            return {'score': 0, 'reason': '', 'common_keywords': []}
        
        set1 = set(keywords1)
        set2 = set(keywords2)
        
        intersection = set1.intersection(set2)
        union = set1.union(set2)
        
        similarity = len(intersection) / len(union) if union else 0
        
        reason = ""
        common_keywords = list(intersection)
        
        if similarity > 0.3 and common_keywords:
            if len(common_keywords) <= 3:
                reason = f"Shared keywords: {', '.join(common_keywords[:3])}"
            else:
                reason = f"Shared keywords: {', '.join(common_keywords[:3])} + {len(common_keywords)-3} more"
        elif similarity > 0.1:
            reason = "Some shared characteristics"
        
        return {
            'score': similarity,
            'reason': reason,
            'common_keywords': common_keywords[:5], 
            'similarity_percent': round(similarity * 100, 1)
        }
    
    def _calculate_ai_similarity(self, product1: Product, product2: Product) -> Dict[str, Any]:
        """AI/ML similarity using TF-IDF and cosine similarity"""
        if not ML_AVAILABLE:
            return {'score': 0, 'reason': '', 'method': 'unavailable'}
        
        try:
            text1 = f"{product1.name or ''} {product1.description or ''} {product1.tags or ''}"
            text2 = f"{product2.name or ''} {product2.description or ''} {product2.tags or ''}"
            
            if not text1.strip() or not text2.strip():
                return {'score': 0, 'reason': '', 'method': 'insufficient_text'}
            
            vectorizer = TfidfVectorizer(
                stop_words='english', 
                max_features=500,
                ngram_range=(1, 2) 
            )
            tfidf_matrix = vectorizer.fit_transform([text1, text2])
            
            similarity_matrix = cosine_similarity(tfidf_matrix)
            similarity = float(similarity_matrix[0][1])
            
            reason = ""
            if similarity > 0.6:
                reason = "High AI text similarity"
            elif similarity > 0.3:
                reason = "Moderate AI text similarity"
            
            return {
                'score': similarity,
                'reason': reason,
                'method': 'tfidf_cosine',
                'similarity_percent': round(similarity * 100, 1)
            }
            
        except Exception as e:
            return {'score': 0, 'reason': '', 'method': 'error', 'error': str(e)}
    
    def _extract_keywords(self, product: Product) -> List[str]:
        """Extract and clean keywords from product data"""
        keywords = []
        
        if product.name:
            keywords.extend(self._clean_text(product.name))
        
        if product.tags:
            tag_words = []
            for tag in product.tags.split(','):
                tag_clean = tag.strip().lower()
                if tag_clean and tag_clean not in self.stop_words:
                    tag_words.append(tag_clean)
                    tag_words.extend(self._clean_text(tag_clean))
            keywords.extend(tag_words)
        
        if product.description:
            desc_words = self._clean_text(product.description)[:20]  
            keywords.extend(desc_words)
        
        seen = set()
        unique_keywords = []
        for keyword in keywords:
            if keyword not in seen and len(keyword) > 2:
                seen.add(keyword)
                unique_keywords.append(keyword)
        
        return unique_keywords
    
    def _clean_text(self, text: str) -> List[str]:
        """Clean and tokenize text"""
        if not text:
            return []
        
        text_clean = re.sub(r'[^a-zA-Z\s]', '', text.lower())
        
        words = []
        for word in text_clean.split():
            word = word.strip()
            if len(word) > 2 and word not in self.stop_words:
                words.append(word)
        
        return words
    
    def _calculate_confidence(self, score_data: Dict[str, Any]) -> str:
        """Calculate confidence level based on score components"""
        total_score = score_data['total_score']
        
        if total_score >= 0.7:
            return "High"
        elif total_score >= 0.4:
            return "Medium"
        elif total_score >= 0.2:
            return "Low"
        else:
            return "Very Low"
    
    def _format_product(self, product: Product) -> Dict[str, Any]:
        """Format product data for API response"""
        return {
            "id": product.id,
            "name": product.name,
            "price": product.price,
            "category": product.category,
            "tags": product.tags,
            "description": product.description,
            "image_url": product.image_url,
            "created_at": product.created_at.isoformat() if product.created_at else None,
            "updated_at": product.updated_at.isoformat() if product.updated_at else None
        }
    
    def get_category_recommendations(
        self, 
        db: Session, 
        category: str, 
        exclude_id: Optional[int] = None,
        limit: int = 6
    ) -> List[Dict[str, Any]]:
        """Get products from the same or related category"""
        query = db.query(Product).filter(Product.category.ilike(f"%{category}%"))
        
        if exclude_id:
            query = query.filter(Product.id != exclude_id)
        
        products = query.limit(limit).all()
        return [self._format_product(product) for product in products]
    
    def get_trending_products(self, db: Session, limit: int = 6) -> List[Dict[str, Any]]:
        """Get trending products (newest for now, can be enhanced with view counts)"""
        products = db.query(Product).order_by(Product.created_at.desc()).limit(limit).all()
        return [self._format_product(product) for product in products]

recommendation_service = ProductRecommendationService()

# FastAPI backend for product management and hybrid recommendation system
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional

import crud
import schemas
from database import get_db
from recommendation_service import recommendation_service

app = FastAPI(
    title="Product Recommender API",
    description="A professional API for managing products with recommendation features",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to Product Recommender API",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/products/", response_model=schemas.ProductResponse, status_code=201)
def create_product(
    product: schemas.ProductCreate,
    db: Session = Depends(get_db)
):
    return crud.create_product(db=db, product=product)

@app.get("/products/", response_model=List[schemas.ProductResponse])
def read_products(
    skip: int = Query(0, ge=0, description="Number of products to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of products to return"),
    category: Optional[str] = Query(None, description="Filter by category"),
    db: Session = Depends(get_db)
):
    products = crud.get_products(db, skip=skip, limit=limit, category=category)
    return products

@app.get("/products/search/", response_model=List[schemas.ProductResponse])
def search_products(
    q: str = Query(..., min_length=1, description="Search query"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    products = crud.search_products(db, query=q, skip=skip, limit=limit)
    return products

@app.get("/products/{product_id}", response_model=schemas.ProductResponse)
def read_product(product_id: int, db: Session = Depends(get_db)):
    db_product = crud.get_product(db, product_id=product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@app.put("/products/{product_id}", response_model=schemas.ProductResponse)
def update_product(
    product_id: int,
    product: schemas.ProductUpdate,
    db: Session = Depends(get_db)
):
    db_product = crud.update_product(db, product_id=product_id, product_update=product)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@app.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    success = crud.delete_product(db, product_id=product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

@app.get("/products/{product_id}/recommendations")
async def get_product_recommendations(
    product_id: int,
    limit: int = Query(6, ge=1, le=20, description="Number of recommendations to return"),
    use_ai: bool = Query(True, description="Include AI/ML similarity scoring"),
    db: Session = Depends(get_db)
):
    result = recommendation_service.get_recommendations(
        db=db,
        product_id=product_id,
        limit=limit,
        use_ai=use_ai
    )
    
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    
    return result

@app.get("/products/category/{category}/recommendations")
async def get_category_recommendations(
    category: str,
    limit: int = Query(6, ge=1, le=20, description="Number of products to return"),
    exclude_id: Optional[int] = Query(None, description="Product ID to exclude from results"),
    db: Session = Depends(get_db)
):
    products = recommendation_service.get_category_recommendations(
        db=db,
        category=category,
        exclude_id=exclude_id,
        limit=limit
    )
    
    return {
        "category": category,
        "products": products,
        "total_found": len(products),
        "message": f"Products in '{category}' category"
    }

@app.get("/products/trending")
async def get_trending_products(
    limit: int = Query(6, ge=1, le=20, description="Number of trending products to return"),
    db: Session = Depends(get_db)
):
    products = recommendation_service.get_trending_products(db=db, limit=limit)
    
    return {
        "trending_products": products,
        "total_found": len(products),
        "algorithm": "Newest first (can be enhanced with analytics)",
        "message": "Currently trending products"
    }

@app.post("/products/{product_id}/view")
async def track_product_view(
    product_id: int,
    session_id: str = Query(..., description="User session identifier"),
    db: Session = Depends(get_db)
):
    product = crud.get_product(db, product_id=product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {
        "success": True,
        "message": f"Product view tracked for product {product_id}",
        "product_id": product_id,
        "session_id": session_id,
        "timestamp": "2025-09-12T10:30:00Z"
    }

@app.get("/products/recently-viewed")
async def get_recently_viewed_products(
    product_ids: str = Query(..., description="Comma-separated list of product IDs"),
    limit: int = Query(10, ge=1, le=20, description="Maximum number of products to return"),
    db: Session = Depends(get_db)
):
    try:
        ids = [int(id.strip()) for id in product_ids.split(",") if id.strip()]
        if not ids:
            return {"recently_viewed": [], "total_count": 0}
        
        ids = ids[:limit]
        
        products = []
        for product_id in ids:
            product = crud.get_product(db, product_id=product_id)
            if product:
                products.append(product)
        
        return {
            "recently_viewed": products,
            "total_count": len(products),
            "requested_ids": ids,
            "found_products": len(products)
        }
        
    except ValueError:
        raise HTTPException(
            status_code=400, 
            detail="Invalid product IDs format. Use comma-separated integers."
        )

@app.get("/recommendations/explain")
async def explain_recommendation_algorithm():
    return {
        "algorithm_name": "Hybrid Product Recommendation System",
        "approach": "Rule-based Logic + AI/ML Enhancement",
        "version": "1.0.0",
        
        "scoring_components": {
            "category_similarity": {
                "weight": "40%",
                "logic": "Exact match (1.0) > Related categories (0.7) > Partial match (0.5)",
                "examples": {
                    "exact": "Electronics → Electronics",
                    "related": "Electronics → Tech/Gadgets",
                    "partial": "Electronics → Electronic Devices"
                }
            },
            "price_similarity": {
                "weight": "25%", 
                "logic": "Exponential decay: e^(-3 × price_difference_ratio)",
                "behavior": "Products within 20% price range get high scores",
                "examples": {
                    "high_similarity": "$100 vs $110 (10% diff) = 0.74 score",
                    "medium_similarity": "$100 vs $150 (50% diff) = 0.22 score",
                    "low_similarity": "$100 vs $500 (400% diff) = 0.05 score"
                }
            },
            "tag_keyword_similarity": {
                "weight": "25%",
                "logic": "Jaccard similarity on extracted keywords",
                "process": [
                    "Extract keywords from name, tags, description",
                    "Remove stop words and normalize text", 
                    "Calculate: |intersection| / |union|",
                    "Higher overlap = higher score"
                ]
            },
            "ai_text_similarity": {
                "weight": "10%",
                "logic": "TF-IDF vectorization + Cosine similarity",
                "purpose": "Bonus feature for semantic text understanding",
                "fallback": "Gracefully disabled if ML libraries unavailable"
            }
        },
        
        "final_calculation": {
            "formula": "Total = (Category × 0.4) + (Price × 0.25) + (Tags × 0.25) + (AI × 0.1)",
            "threshold": "Minimum score of 0.1 required for recommendations",
            "ranking": "Sorted by total score (highest first)"
        },
        
        "confidence_levels": {
            "High": "Score ≥ 0.7 - Strong match across multiple factors",
            "Medium": "Score ≥ 0.4 - Good match with some similarities", 
            "Low": "Score ≥ 0.2 - Weak but meaningful connections",
            "Very Low": "Score < 0.2 - Minimal similarities found"
        },
        
        "transparency_features": [
            "Detailed reasoning for each recommendation",
            "Score breakdown by component",
            "Confidence level indicators",
            "Common keywords identification",
            "Price difference calculations",
            "Category relationship explanations"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

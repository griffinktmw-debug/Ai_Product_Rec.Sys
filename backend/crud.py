# Database CRUD operations for Product model
from sqlalchemy.orm import Session
from typing import List, Optional
from database import Product
from schemas import ProductCreate, ProductUpdate

def get_products(db: Session, skip: int = 0, limit: int = 100, category: Optional[str] = None) -> List[Product]:
    query = db.query(Product)
    if category:
        query = query.filter(Product.category.ilike(f"%{category}%"))
    return query.offset(skip).limit(limit).all()

def get_product(db: Session, product_id: int) -> Optional[Product]:
    return db.query(Product).filter(Product.id == product_id).first()

def create_product(db: Session, product: ProductCreate) -> Product:
    db_product = Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, product_id: int, product_update: ProductUpdate) -> Optional[Product]:
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if db_product:
        update_data = product_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_product, field, value)
        db.commit()
        db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int) -> bool:
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if db_product:
        db.delete(db_product)
        db.commit()
        return True
    return False

def search_products(db: Session, query: str, skip: int = 0, limit: int = 100) -> List[Product]:
    return db.query(Product).filter(
        Product.name.ilike(f"%{query}%") | 
        Product.description.ilike(f"%{query}%") |
        Product.tags.ilike(f"%{query}%")
    ).offset(skip).limit(limit).all()

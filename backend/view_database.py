# Script to view and display all products in the database
from sqlalchemy.orm import Session
from database import SessionLocal, Product, engine, Base
import json

def view_database_items():
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        products = db.query(Product).all()
        
        print("=== DATABASE CONTENTS ===")
        print(f"Total products: {len(products)}")
        print()
        
        if not products:
            print("No products found in the database.")
            print()
            print("To add sample data, you can:")
            print("1. Use the API endpoints at http://localhost:8000/docs")
            print("2. Run the seed_data.py script when the server is running")
            print("3. Add products manually using this script")
            return
        
        for i, product in enumerate(products, 1):
            print(f"--- Product {i} ---")
            print(f"ID: {product.id}")
            print(f"Name: {product.name}")
            print(f"Price: ${product.price:.2f}")
            print(f"Category: {product.category}")
            print(f"Tags: {product.tags}")
            print(f"Description: {product.description}")
            print(f"Image URL: {product.image_url}")
            print(f"Created: {product.created_at}")
            print(f"Updated: {product.updated_at}")
            print()
    
    except Exception as e:
        print(f"Error viewing database: {e}")
    
    finally:
        db.close()

def add_sample_data():
    """Add sample data directly to the database"""
    
    sample_products = [
        {
            "name": "Wireless Bluetooth Headphones",
            "price": 79.99,
            "category": "Electronics",
            "tags": "audio, wireless, bluetooth, headphones",
            "description": "High-quality wireless headphones with noise cancellation and 20-hour battery life.",
            "image_url": "https://via.placeholder.com/300x200?text=Headphones"
        },
        {
            "name": "Organic Cotton T-Shirt",
            "price": 24.99,
            "category": "Clothing",
            "tags": "organic, cotton, t-shirt, sustainable",
            "description": "Comfortable organic cotton t-shirt made from sustainable materials.",
            "image_url": "https://via.placeholder.com/300x200?text=T-Shirt"
        },
        {
            "name": "Smart Fitness Watch",
            "price": 199.99,
            "category": "Electronics",
            "tags": "fitness, smartwatch, health, tracking",
            "description": "Advanced fitness tracker with heart rate monitoring and GPS.",
            "image_url": "https://via.placeholder.com/300x200?text=Smart+Watch"
        }
    ]
    
    db = SessionLocal()
    
    try:
        print("Adding sample products...")
        
        for product_data in sample_products:
            existing = db.query(Product).filter(Product.name == product_data["name"]).first()
            if existing:
                print(f"Product '{product_data['name']}' already exists, skipping...")
                continue
            
            product = Product(**product_data)
            db.add(product)
            print(f"Added: {product_data['name']}")
        
        db.commit()
        print("Sample data added successfully!")
        
    except Exception as e:
        print(f"Error adding sample data: {e}")
        db.rollback()
    
    finally:
        db.close()

if __name__ == "__main__":
    print("Database Viewer Tool")
    print("===================")
    
    view_database_items()
    
    response = input("Would you like to add sample data? (y/n): ").lower().strip()
    if response in ['y', 'yes']:
        add_sample_data()
        print()
        print("Updated database contents:")
        view_database_items()

# Database seeding script to populate products for testing and demonstration
import requests
import json

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
    },
    {
        "name": "Premium Coffee Beans",
        "price": 18.99,
        "category": "Food & Beverage",
        "tags": "coffee, premium, arabica, beans",
        "description": "Single-origin arabica coffee beans with rich flavor profile.",
        "image_url": "https://via.placeholder.com/300x200?text=Coffee+Beans"
    },
    {
        "name": "Ergonomic Office Chair",
        "price": 299.99,
        "category": "Furniture",
        "tags": "office, chair, ergonomic, furniture",
        "description": "Comfortable ergonomic office chair with lumbar support and adjustable height.",
        "image_url": "https://via.placeholder.com/300x200?text=Office+Chair"
    }
]

def populate_database():
    base_url = "http://localhost:8000"
    
    print("Adding sample products to the database...")
    
    for product in sample_products:
        try:
            response = requests.post(f"{base_url}/products/", json=product)
            if response.status_code == 201:
                print(f"✓ Added: {product['name']}")
            else:
                print(f"✗ Failed to add: {product['name']} - {response.text}")
        except requests.exceptions.RequestException as e:
            print(f"✗ Error adding {product['name']}: {e}")
    
    print("\nSample data population complete!")

if __name__ == "__main__":
    populate_database()

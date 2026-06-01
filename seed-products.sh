#!/bin/bash

# Sample Products Seed Script
# Run this script to populate the database with sample products
# Usage: ./seed-products.sh

API_URL="http://localhost:5000/api"

echo "Seeding products..."

# Shoes
curl -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wool Runner",
    "description": "Our most popular shoe. Designed for everyday comfort with sustainable wool.",
    "price": 98,
    "images": ["https://via.placeholder.com/500?text=Wool+Runner"],
    "sizes": ["5", "6", "7", "8", "9", "10", "11", "12", "13"],
    "colors": [{"name": "Natural", "hex": "#E8E8E8"}, {"name": "Black", "hex": "#000000"}],
    "stock": 50,
    "category": "shoes",
    "rating": 4.8,
    "reviews": 245,
    "sustainable": true
  }'

curl -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tree Dashers",
    "description": "Lightweight runners made from sustainably grown trees.",
    "price": 80,
    "images": ["https://via.placeholder.com/500?text=Tree+Dasher"],
    "sizes": ["5", "6", "7", "8", "9", "10", "11", "12"],
    "colors": [{"name": "White", "hex": "#FFFFFF"}, {"name": "Gray", "hex": "#808080"}],
    "stock": 40,
    "category": "shoes",
    "rating": 4.6,
    "reviews": 189,
    "sustainable": true
  }'

# Apparel
curl -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tree Essentials T-Shirt",
    "description": "Ultra-soft t-shirt made from sustainable tree fiber.",
    "price": 45,
    "images": ["https://via.placeholder.com/500?text=T-Shirt"],
    "sizes": ["XS", "S", "M", "L", "XL", "XXL"],
    "colors": [{"name": "White", "hex": "#FFFFFF"}, {"name": "Black", "hex": "#000000"}, {"name": "Olive", "hex": "#808000"}],
    "stock": 100,
    "category": "apparel",
    "rating": 4.7,
    "reviews": 156,
    "sustainable": true
  }'

curl -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wool Sweater",
    "description": "Cozy wool sweater perfect for any season.",
    "price": 128,
    "images": ["https://via.placeholder.com/500?text=Sweater"],
    "sizes": ["XS", "S", "M", "L", "XL"],
    "colors": [{"name": "Cream", "hex": "#FFFDD0"}, {"name": "Navy", "hex": "#000080"}],
    "stock": 30,
    "category": "apparel",
    "rating": 4.9,
    "reviews": 98,
    "sustainable": true
  }'

# Accessories
curl -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wool Socks Pack",
    "description": "Set of 3 sustainable wool socks.",
    "price": 28,
    "images": ["https://via.placeholder.com/500?text=Socks"],
    "sizes": ["One Size"],
    "colors": [{"name": "Mixed", "hex": "#808080"}],
    "stock": 200,
    "category": "accessories",
    "rating": 4.8,
    "reviews": 324,
    "sustainable": true
  }'

curl -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Canvas Backpack",
    "description": "Durable canvas backpack made from sustainable materials.",
    "price": 85,
    "images": ["https://via.placeholder.com/500?text=Backpack"],
    "sizes": ["One Size"],
    "colors": [{"name": "Black", "hex": "#000000"}, {"name": "Tan", "hex": "#D2B48C"}],
    "stock": 45,
    "category": "accessories",
    "rating": 4.6,
    "reviews": 112,
    "sustainable": true
  }'

echo "Products seeded successfully!"

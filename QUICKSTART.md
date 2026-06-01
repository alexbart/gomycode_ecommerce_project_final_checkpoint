# Quick Start Guide - EcoMart Ecommerce

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install:all
```

### Step 2: Configure Environment

**Server (.env)**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=dev_secret_key_change_in_production
```

**Client (.env)** (optional, defaults to localhost:5000)
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Start MongoDB
```bash
# If installed locally
mongod

# Or use MongoDB Atlas and update MONGODB_URI accordingly
```

### Step 4: Start Development Servers
```bash
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:5000
- API: http://localhost:5000/api

## 📝 Seed Sample Products

Option 1: Using curl (from bash/powershell)
```bash
./seed-products.sh
```

Option 2: Manual curl command
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wool Runner",
    "description": "Comfortable sustainable runners",
    "price": 98,
    "images": ["https://via.placeholder.com/500?text=Product"],
    "sizes": ["5", "6", "7", "8", "9", "10"],
    "colors": [{"name": "Black", "hex": "#000000"}],
    "stock": 50,
    "category": "shoes",
    "rating": 4.8,
    "reviews": 100,
    "sustainable": true
  }'
```

## 🧪 Test the Application

### 1. Register a New Account
- Go to http://localhost:5173/register
- Fill in the form and create an account
- You'll be automatically logged in

### 2. Browse Products
- Homepage shows all products
- Use filters by category
- Sort by price, rating, or newest

### 3. Add to Cart
- Click on a product
- Select size and color
- Set quantity
- Click "Add to Cart"

### 4. Manage Cart
- Go to /cart
- Update quantities
- Remove items
- See total price

### 5. Add to Wishlist
- Heart icon on product pages
- View in /wishlist

### 6. Checkout
- Go to /cart → "Proceed to Checkout"
- Enter shipping address
- Click "Place Order"

### 7. View Orders
- Go to /account → "My Orders"
- See order history and status

## 📁 Project Structure

```
client/                         Frontend React app
├── src/
│   ├── api/                     API client & endpoints
│   ├── components/              Reusable React components
│   ├── context/                 Auth context provider
│   ├── pages/                   Page components
│   ├── App.tsx                  Main app with routing
│   └── main.tsx                 Entry point

server/                          Express backend
├── src/
│   ├── models/                  MongoDB Mongoose schemas
│   ├── routes/                  API route handlers
│   ├── middleware/              Auth middleware
│   ├── db/                      Database connection
│   └── server.ts                Server entry point
└── .env                         Environment variables
```

## 🔑 Key Features Implemented

✅ User Authentication (Register/Login)
✅ JWT-based Authorization
✅ Product Catalog with Filtering
✅ Shopping Cart
✅ Wishlist
✅ Order Management
✅ User Profile & Address Management
✅ Order History & Tracking

## 🛠 Useful Commands

```bash
# Development
npm run dev                  # Run both client & server
npm run dev:client          # Client only
npm run dev:server          # Server only

# Building
npm run build               # Build for production

# Server specific
npm run build               # Compile TypeScript (server directory)
npm run start               # Run production build

# Client specific
npm run lint                # Run ESLint
npm run preview             # Preview production build
```

## 🐛 Troubleshooting

### "Cannot GET /api/products"
- Ensure server is running on port 5000
- Check that MONGODB_URI is correctly configured
- Verify MongoDB is running

### CORS errors
- Ensure client URL is `http://localhost:5173`
- Server has CORS enabled by default

### "Cannot connect to MongoDB"
- Start MongoDB: `mongod`
- Check MONGODB_URI connection string
- Ensure MongoDB service is running

### Port conflicts
- Change PORT in server/.env
- Change client port: `npm run dev -- --port 3000` (from client dir)

## 📚 Next Steps

1. **Add Sample Data** - Use seed-products.sh to populate database
2. **Customize Design** - Edit Tailwind classes in components
3. **Add Payment** - Integrate Stripe or PayPal
4. **Admin Dashboard** - Create admin routes and pages
5. **Email Notifications** - Set up transactional emails
6. **Deploy** - Deploy to Vercel (client) and Heroku/Railway (server)

## 📖 API Documentation

See [ECOMMERCE_README.md](./ECOMMERCE_README.md) for complete API documentation.

## 🎨 Customization Tips

### Change Store Name
1. Update `Navigation.tsx` - "EcoMart" text
2. Update page titles and metadata

### Change Colors
1. Edit Tailwind classes in components
2. Default: Gray/Black theme (matches Allbirds)
3. Modify hex values in component styles

### Add More Categories
1. Update Product model category enum
2. Add category filter in ProductsPage
3. Add category routes

## 📞 Need Help?

Refer to [ECOMMERCE_README.md](./ECOMMERCE_README.md) for comprehensive documentation.

Happy coding! 🎉

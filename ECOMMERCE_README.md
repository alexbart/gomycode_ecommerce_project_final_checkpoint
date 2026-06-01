# EcoMart - Ecommerce Website

An Allbirds-inspired ecommerce platform built with MERN stack (MongoDB, Express, React, Node.js).

## Features

✅ **Product Catalog**
- Browse products by category (shoes, apparel, accessories)
- Filter and sort products
- Search functionality
- Detailed product pages with images, colors, and sizes

✅ **User Accounts**
- User registration and login
- JWT-based authentication
- User profile management
- Address management

✅ **Shopping Features**
- Add products to cart
- Manage cart items (update quantity, remove)
- Wishlist functionality
- Quick view and product details

✅ **Orders**
- Checkout process
- Order history
- Order tracking with status
- Order cancellation

## Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - API calls

### Backend
- **Express.js** - Web server
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin requests

## Project Structure

```
mern-app-template/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # API client & endpoints
│   │   ├── components/    # Reusable components
│   │   ├── context/       # Auth context
│   │   ├── pages/         # Page components
│   │   ├── App.tsx        # Main app with routing
│   │   └── main.tsx       # Entry point
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── models/        # MongoDB schemas
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth middleware
│   │   ├── db/            # Database connection
│   │   └── server.ts      # Server entry point
│   ├── .env               # Environment variables
│   └── package.json
└── package.json           # Root workspace config
```

## Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB instance (local or MongoDB Atlas)

### Setup

1. **Clone and install dependencies:**
   ```bash
   npm install:all
   ```

2. **Configure environment variables:**
   
   Create `server/.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   JWT_SECRET=your_secret_key_change_in_production
   ```

3. **Start MongoDB:**
   ```bash
   # If running locally
   mongod
   ```

4. **Run the development servers:**
   ```bash
   npm run dev
   ```

   This starts both client (http://localhost:5173) and server (http://localhost:5000) concurrently.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update user profile

### Products
- `GET /api/products` - Get all products (with filters & pagination)
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/search/:query` - Search products
- `POST /api/products` - Create product (admin)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `POST /api/cart/remove` - Remove item from cart
- `PUT /api/cart/update` - Update item quantity
- `DELETE /api/cart` - Clear cart

### Wishlist
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist/add` - Add product to wishlist
- `POST /api/wishlist/remove` - Remove product from wishlist
- `GET /api/wishlist/check/:productId` - Check if product in wishlist

### Orders
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create order (checkout)
- `PUT /api/orders/:id/cancel` - Cancel order

## Usage

### For Customers

1. **Browse Products**
   - Visit homepage to see all products
   - Use filters by category, sort by price/rating/newest
   - Click on product to see details

2. **Add to Cart**
   - Select size and color (if available)
   - Choose quantity
   - Click "Add to Cart"

3. **Manage Wishlist**
   - Click heart icon to add/remove from wishlist
   - View all wishlist items on wishlist page

4. **Checkout**
   - Review cart items
   - Enter shipping address
   - Place order

5. **Manage Account**
   - View order history
   - Update profile information
   - Manage saved addresses

### For Developers

#### Adding New Products

You can seed products using the API:

```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wool Runner",
    "description": "Comfortable sustainable runners",
    "price": 98,
    "images": ["https://..."],
    "sizes": ["5", "6", "7", "8", "9", "10", "11", "12"],
    "colors": [{"name": "Black", "hex": "#000000"}],
    "stock": 50,
    "category": "shoes",
    "sustainable": true
  }'
```

#### Extending Features

1. **Add Payment Integration**
   - Integrate Stripe or PayPal in checkout
   - Update Order model to track payment status

2. **Add Product Reviews**
   - Create Review model
   - Add review routes
   - Display reviews on product detail page

3. **Admin Dashboard**
   - Create admin routes and pages
   - Add order management
   - Add inventory management

4. **Email Notifications**
   - Send confirmation emails on registration
   - Send order status updates
   - Use services like SendGrid or Mailgun

## Next Steps

- [ ] Add sample product data
- [ ] Integrate Stripe payment processing
- [ ] Add product reviews and ratings
- [ ] Create admin dashboard
- [ ] Implement search indexing for better performance
- [ ] Add email notifications
- [ ] Set up error logging and monitoring
- [ ] Deploy to production

## Available Scripts

```bash
# Root level
npm run dev              # Run both client and server
npm run dev:client      # Run only client
npm run dev:server      # Run only server
npm run build           # Build both client and server
npm install:all         # Install dependencies for all workspaces

# Client only (from client directory)
npm run dev             # Start Vite dev server
npm run build           # Build for production
npm run lint            # Run ESLint
npm run preview         # Preview production build

# Server only (from server directory)
npm run dev             # Start server with hot reload (tsx watch)
npm run build           # Compile TypeScript
npm run start           # Run compiled server
```

## Environment Variables

### Server (.env)
```env
PORT=5000                              # Server port
MONGODB_URI=mongodb://...              # MongoDB connection string
JWT_SECRET=your_secret_key             # JWT signing secret
```

### Client (.env)
```env
VITE_API_URL=http://localhost:5000/api # API URL (optional, defaults to localhost:5000)
```

## Troubleshooting

### "Cannot find module" errors
- Run `npm install:all` from root
- Clear node_modules and reinstall if issues persist

### Database connection errors
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify connection string format

### CORS errors
- Ensure server is running on correct port
- Check that client is making requests to correct API URL
- Verify CORS middleware is enabled in server.ts

### Port already in use
- Change PORT in `.env` (server)
- Change Vite port: `npm run dev -- --port 3000` (client)

## License

MIT

## Support

For issues or questions, please create an issue in the repository or contact the development team.

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'EcoMart API Documentation',
    version: '1.0.0',
    description: 'RESTful API for EcoMart e-commerce platform',
    contact: {
      name: 'EcoMart Support',
      email: 'support@ecomart.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000/api',
      description: 'Development server',
    },
    {
      url: 'https://gomycode-ecommerce-project-final-ch.vercel.app/api',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Product: {
        type: 'object',
        properties: {
          _id: { type: 'string', description: 'Product ID' },
          name: { type: 'string', description: 'Product name' },
          description: { type: 'string', description: 'Product description' },
          price: { type: 'number', description: 'Product price' },
          images: {
            type: 'array',
            items: { type: 'string' },
            description: 'Product images',
          },
          category: {
            type: 'string',
            enum: ['electronics', 'jewelry', 'mens', 'womens'],
            description: 'Product category',
          },
          rating: { type: 'number', description: 'Product rating (0-5)' },
          reviews: { type: 'number', description: 'Number of reviews' },
          stock: { type: 'number', description: 'Stock quantity' },
          sustainable: { type: 'boolean', description: 'Is product sustainable' },
          sizes: {
            type: 'array',
            items: { type: 'string' },
            description: 'Available sizes',
          },
          colors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                hex: { type: 'string' },
              },
            },
            description: 'Available colors',
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Category: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          count: { type: 'number' },
          description: { type: 'string' },
        },
      },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Cart: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          userId: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                productId: { type: 'string' },
                quantity: { type: 'number' },
                price: { type: 'number' },
              },
            },
          },
          total: { type: 'number' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/products': {
      get: {
        tags: ['Products'],
        summary: 'Get all products',
        description: 'Retrieve all products with optional filtering, sorting, and pagination',
        parameters: [
          {
            in: 'query',
            name: 'category',
            schema: { type: 'string', enum: ['all', 'electronics', 'jewelry', 'mens', 'womens'] },
            description: 'Filter by category',
          },
          {
            in: 'query',
            name: 'sortBy',
            schema: { type: 'string', enum: ['price', 'rating', 'newest'] },
            description: 'Sort by field',
          },
          {
            in: 'query',
            name: 'order',
            schema: { type: 'string', enum: ['asc', 'desc'] },
            description: 'Sort order',
          },
          {
            in: 'query',
            name: 'page',
            schema: { type: 'number', default: 1 },
            description: 'Page number for pagination',
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'number', default: 12 },
            description: 'Number of products per page',
          },
        ],
        responses: {
          200: {
            description: 'Successfully retrieved products',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    products: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
                    total: { type: 'number' },
                    page: { type: 'number' },
                    pages: { type: 'number' },
                  },
                },
              },
            },
          },
          500: { description: 'Server error' },
        },
      },
      post: {
        tags: ['Products'],
        summary: 'Create a new product',
        description: 'Create a new product (admin authentication coming soon)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } },
        },
        responses: {
          201: { description: 'Product successfully created' },
          400: { description: 'Invalid product data' },
        },
      },
    },
    '/products/categories': {
      get: {
        tags: ['Products'],
        summary: 'Get all product categories',
        description: 'Retrieve all available product categories with product counts',
        responses: {
          200: {
            description: 'Successfully retrieved categories',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Category' } },
              },
            },
          },
        },
      },
    },
    '/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get a product by ID',
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Successfully retrieved product' },
          404: { description: 'Product not found' },
        },
      },
    },
    '/products/search/{query}': {
      get: {
        tags: ['Products'],
        summary: 'Search products',
        parameters: [
          { in: 'path', name: 'query', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Successfully retrieved search results' },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User successfully registered' },
          409: { description: 'Email already in use' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'User successfully logged in' },
          401: { description: 'Invalid email or password' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Successfully retrieved user profile' },
          401: { description: 'Unauthorized' },
        },
      },
      put: {
        tags: ['Authentication'],
        summary: 'Update user profile',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  phone: { type: 'string' },
                  address: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'User profile successfully updated' },
          401: { description: 'Unauthorized' },
        },
      },
    },
  },
}

export { swaggerSpec }

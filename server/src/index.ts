import 'dotenv/config';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth/config.js";

// Import your routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import roleRequestRoutes from './routes/roleRequestRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import cmsRoutes from './routes/cmsRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { handleStripeWebhook } from './controllers/webhookController.js';
import { errorHandler } from './middleware/error.js';

const app: Express = express();

// 1. CORS Configuration
const allowedOrigins = [
  process.env.CLIENT_URL || "http://127.0.0.1:3000",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
];

app.use(cors({ 
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }
      return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
    }
    return callback(null, true);
  },
  credentials: true 
}));

// 2. STRIPE WEBHOOK (Must be before express.json() for raw body)
app.post('/api/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// 3. STANDARD MIDDLEWARE
app.use(express.json());

// 4. BETTER AUTH HANDLER
app.all("/api/auth/*", (req, res, next) => {
  if (req.path === '/api/auth/me' || req.path.startsWith('/api/auth/users') || req.path === '/api/auth/profile' || req.path === '/api/auth/notifications') {
    return next();
  }
  return toNodeHandler(auth)(req, res);
});

// 5. API ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/requests', roleRequestRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Nexus Multi-Vendor API is working perfectly!',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK' });
});

// 6. Error Handler
app.use(errorHandler);

// 7. VERCEL / LOCAL LISTENER
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Local Server running on port ${PORT}`));
}

export default app;

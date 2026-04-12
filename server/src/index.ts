import 'dotenv/config';
import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth/config.js";
import uploadRoutes from './routes/uploadRoutes.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import roleRequestRoutes from './routes/roleRequestRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import cmsRoutes from './routes/cmsRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import { errorHandler } from './middleware/error.js';

const app: Express = express();
const PORT = process.env.PORT || 5000;

// 1. CORS Middleware (Must be before any handlers)
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://localhost:3001'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With', 'x-better-auth-id'],
}));

// 2. Favicon Fix
app.get('/favicon.ico', (req, res) => res.status(204).end());

// 3. Global Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Custom Auth Routes (mounted at /api/auth)
app.use('/api/auth', authRoutes);

// 5. Better Auth Internal Handler
app.all("/api/auth/*", (req, res) => {
  return toNodeHandler(auth)(req, res);
});

// 6. Other Application Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/requests', roleRequestRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/delivery', deliveryRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});

export default app;

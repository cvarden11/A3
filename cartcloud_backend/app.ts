import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import userRoutes from './routes/users';
import productRoutes from './routes/products'
import cors from 'cors';
import authRoutes from './routes/auth';
import cartRoutes from './routes/carts'
import wishlistRoutes from './routes/wishlists'
import orderRoutes from './routes/orders'
import compression from 'compression';
import client from 'prom-client';


const env = process.env.NODE_ENV || 'dev';
dotenv.config({ path: `.env.${env}` });

const app = express();

client.collectDefaultMetrics();

const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 1.5, 2, 5] // Customize as needed
});


app.use((req, res, next) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.route?.path || req.path, status_code: res.statusCode });
  });
  next();
});

app.use(express.json());
app.options('*', cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(compression());


app.use('/users', userRoutes)
app.use('/products', productRoutes)
app.use('/api/auth', authRoutes);
app.use('/carts', cartRoutes)
app.use('/wishlists', wishlistRoutes)
app.use('/orders', orderRoutes)

connectDB();

app.get('/', (_req, res) => {
  res.send('API is running...');
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



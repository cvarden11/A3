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

const env = process.env.NODE_ENV || 'dev';
dotenv.config({ path: `.env.${env}` });

const app = express();
app.use(express.json());
app.use(cors())

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



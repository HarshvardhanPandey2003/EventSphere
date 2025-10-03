// backend/src/app.js
import 'dotenv/config';  // Add this at the VERY TOP - before any other imports
import express from 'express';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';

const app = express();

app.use(express.json());
app.use(cookieParser());

connectDB();

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`JWT_SECRET is ${process.env.JWT_SECRET ? 'loaded' : 'NOT loaded'}`); // Add this for debugging
});

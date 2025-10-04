// backend/src/app.js
import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/event.routes.js';  // Add this

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(cookieParser());

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);  // Add this

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`JWT_SECRET is ${process.env.JWT_SECRET ? 'loaded' : 'NOT loaded'}`);
});

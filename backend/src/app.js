// backend/src/app.js
import dotenv from 'dotenv';

// Load environment config based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : '.env.development';
dotenv.config({ path: envFile });

console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, closeDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/event.routes.js';  
import profileRoutes from './routes/profile.routes.js';  

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Initialize database connection
await connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes); 
app.use('/api/profile', profileRoutes);  

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ JWT_SECRET: ${process.env.JWT_SECRET ? 'loaded' : 'NOT loaded'}`);
});

// Graceful shutdown
const shutdown = async () => {
  console.log('\n🛑 Shutting down gracefully...');
  server.close(async () => {
    await closeDB();
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

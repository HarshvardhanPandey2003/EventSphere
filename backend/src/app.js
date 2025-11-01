// backend/src/app.js
import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import dbConnection from './config/dbConnection.js';
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/event.routes.js';  
import profileRoutes from './routes/profile.routes.js';  

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables (single .env file)
dotenv.config();

console.log(` Environment: ${process.env.NODE_ENV || 'production'}`);
console.log(` JWT_SECRET: ${process.env.JWT_SECRET ? ' loaded' : ' NOT loaded'}`);

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Initialize Azure SQL connection
await dbConnection.connect();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes); 
app.use('/api/profile', profileRoutes);  

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const result = await dbConnection.query('SELECT 1 as health');
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      server: process.env.AZURE_SQL_SERVER
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Azure SQL Database connected`);
});

// Graceful shutdown
const shutdown = async () => {
  console.log('\n Shutting down gracefully...');
  
  server.close(async () => {
    console.log(' HTTP server closed');
    
    try {
      await dbConnection.disconnect();
      console.log(' Database connection closed');
      process.exit(0);
    } catch (error) {
      console.error(' Error closing database connection:', error.message);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    console.error(' Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;

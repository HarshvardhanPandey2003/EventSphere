// backend/src/config/db.js
import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'eventsphere',
  password: process.env.PGPASSWORD || 'postgres',
  port: process.env.PGPORT || 5432,
});

export const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL');
    client.release();
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
};

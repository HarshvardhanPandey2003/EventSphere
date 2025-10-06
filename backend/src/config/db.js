// backend/src/config/db.js
import pkg from 'pg';
const { Pool } = pkg;
import { DefaultAzureCredential } from '@azure/identity';

let poolInstance;
let azureCredential;
let tokenRefreshInterval;

// Get Azure access token
async function getAzureAccessToken() {
  if (!azureCredential) {
    azureCredential = new DefaultAzureCredential();
  }
  
  try {
    const tokenResponse = await azureCredential.getToken(
      'https://ossrdbms-aad.database.windows.net/.default'
    );
    return tokenResponse.token;
  } catch (error) {
    console.error('Failed to get Azure access token:', error.message);
    throw error;
  }
}

// Create pool based on environment
async function createPool() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction && process.env.AZURE_POSTGRES_HOST) {
    // Azure PostgreSQL with Entra ID
    const token = await getAzureAccessToken();
    
    poolInstance = new Pool({
      host: process.env.AZURE_POSTGRES_HOST,
      database: process.env.AZURE_POSTGRES_DATABASE,
      port: parseInt(process.env.AZURE_POSTGRES_PORT) || 5432,
      user: process.env.AZURE_POSTGRES_USER,
      password: token,
      ssl: {
        rejectUnauthorized: false
      },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    
    console.log('✓ Using Azure PostgreSQL (Production)');
    
    // Token refresh every 50 minutes
    tokenRefreshInterval = setInterval(async () => {
      try {
        const newToken = await getAzureAccessToken();
        await poolInstance.end();
        
        poolInstance = new Pool({
          host: process.env.AZURE_POSTGRES_HOST,
          database: process.env.AZURE_POSTGRES_DATABASE,
          port: parseInt(process.env.AZURE_POSTGRES_PORT) || 5432,
          user: process.env.AZURE_POSTGRES_USER,
          password: newToken,
          ssl: { rejectUnauthorized: false },
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 10000,
        });
        
        console.log('✓ Azure token refreshed');
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }, 50 * 60 * 1000);
    
  } else {
    // Local PostgreSQL (Development)
    poolInstance = new Pool({
      user: process.env.PGUSER,
      host: process.env.PGHOST,
      database: process.env.PGDATABASE,
      password: process.env.PGPASSWORD,
      port: parseInt(process.env.PGPORT) || 5432,
      max: 10,
    });
    
    console.log('✓ Using Local PostgreSQL (Development)');
  }
  
  return poolInstance;
}

// Export pool directly (lazy initialization with Proxy)
export const pool = new Proxy({}, {
  get: (target, prop) => {
    if (!poolInstance) {
      throw new Error(
        'Database not initialized. Call connectDB() first in app.js'
      );
    }
    return poolInstance[prop];
  }
});

// Initialize database connection
export const connectDB = async () => {
  try {
    await createPool();
    const client = await poolInstance.connect();
    const result = await client.query('SELECT NOW()');
    console.log(`✓ Database connected at ${result.rows[0].now}`);
    client.release();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
};

// Close database connections
export const closeDB = async () => {
  if (tokenRefreshInterval) {
    clearInterval(tokenRefreshInterval);
  }
  if (poolInstance) {
    await poolInstance.end();
    console.log('✓ Database connections closed');
  }
};

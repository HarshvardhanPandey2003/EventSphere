// backend/src/config/db.js
import pkg from 'pg';
const { Pool } = pkg;
import { ClientSecretCredential } from '@azure/identity';

let poolInstance;
let tokenRefreshInterval;

async function getAzureAccessToken() {
  const credential = new ClientSecretCredential(
    process.env.AZURE_TENANT_ID,
    process.env.AZURE_CLIENT_ID,
    process.env.AZURE_CLIENT_SECRET
  );
  
  try {
    const tokenResponse = await credential.getToken(
      'https://ossrdbms-aad.database.windows.net/.default'
    );
    console.log('✓ Access token obtained');
    return tokenResponse.token;
  } catch (error) {
    console.error('Failed to get Azure access token:', error.message);
    throw error;
  }
}

async function createPool() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  if (isProduction && process.env.POSTGRES_HOST) {
    console.log('Attempting Azure PostgreSQL connection...');
    console.log('Host:', process.env.POSTGRES_HOST);
    console.log('Database:', process.env.POSTGRES_DB);
    console.log('User (Client ID):', process.env.AZURE_CLIENT_ID);
    
    // Get initial token
    const token = await getAzureAccessToken();
    
    poolInstance = new Pool({
      host: process.env.POSTGRES_HOST,
      database: process.env.POSTGRES_DB,
      port: parseInt(process.env.POSTGRES_PORT) || 5432,
      user: process.env.AZURE_CLIENT_ID,  // Service principal client ID as username
      password: token,                     // Token as password
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    
    console.log('✓ Using Azure PostgreSQL (Production with AAD)');
    
    // Auto-refresh token every 50 minutes (tokens expire after 60 minutes)
    tokenRefreshInterval = setInterval(async () => {
      try {
        console.log('Refreshing access token...');
        const newToken = await getAzureAccessToken();
        
        // Close existing pool and create new one with refreshed token
        await poolInstance.end();
        
        poolInstance = new Pool({
          host: process.env.POSTGRES_HOST,
          database: process.env.POSTGRES_DB,
          port: parseInt(process.env.POSTGRES_PORT) || 5432,
          user: process.env.AZURE_CLIENT_ID,
          password: newToken,
          ssl: { rejectUnauthorized: false },
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 10000,
        });
        
        console.log('✓ Azure token refreshed and pool recreated');
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }, 50 * 60 * 10000);
    
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

export const pool = new Proxy({}, {
  get: (target, prop) => {
    if (!poolInstance) {
      throw new Error('Database not initialized. Call connectDB() first');
    }
    return poolInstance[prop];
  }
});

export const connectDB = async () => {
  try {
    console.log('Initializing database connection...');
    await createPool();
    
    console.log('Testing connection...');
    const client = await poolInstance.connect();
    const result = await client.query('SELECT NOW()');
    console.log(`✓ Database connected at ${result.rows[0].now}`);
    client.release();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  }
};

export const closeDB = async () => {
  if (tokenRefreshInterval) {
    clearInterval(tokenRefreshInterval);
  }
  if (poolInstance) {
    await poolInstance.end();
    console.log('✓ Database connections closed');
  }
};

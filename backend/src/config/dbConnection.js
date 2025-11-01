// config/dbConnection.js
import sql from 'mssql';
import dbConfig from './db.js';

class DatabaseConnection {
  constructor() {
    this.pool = null;
    this.connected = false;
  }

  async connect() {
    try {
      if (this.connected && this.pool) {
        console.log('Database already connected');
        return this.pool;
      }

      console.log('Connecting to Azure SQL Database...');
      this.pool = await sql.connect(dbConfig);
      this.connected = true;
      
      console.log('Connected to Azure SQL Database');
      console.log(`Server: ${dbConfig.server}`);
      console.log(`Database: ${dbConfig.database}`);
      
      return this.pool;
    } catch (error) {
      console.error('Azure SQL connection failed:', error.message);
      console.error('Server:', dbConfig.server);
      console.error('Database:', dbConfig.database);
      
      if (error.message.includes('login')) {
        console.error('\nAuthentication Tips:');
        console.error('1. Run: az login');
        console.error('2. Or set AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID');
        console.error('3. Make sure your user/SP has database access');
      }
      
      if (error.message.includes('firewall')) {
        console.error('\nFirewall Tips:');
        console.error('1. Check Azure SQL firewall rules');
        console.error('2. Add your current IP address');
      }
      
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.pool) {
        await this.pool.close();
        this.connected = false;
        console.log('Disconnected from Azure SQL Database');
      }
    } catch (error) {
      console.error('Error disconnecting:', error.message);
      throw error;
    }
  }

  async query(queryString, params = {}) {
    try {
      if (!this.connected) {
        await this.connect();
      }

      const request = this.pool.request();
      
      // Add parameters to the request
      Object.keys(params).forEach(key => {
        request.input(key, params[key]);
      });

      const result = await request.query(queryString);
      return result.recordset;
    } catch (error) {
      console.error('Query execution failed:', error.message);
      console.error('Query:', queryString);
      throw error;
    }
  }

  async execute(procedureName, params = {}) {
    try {
      if (!this.connected) {
        await this.connect();
      }

      const request = this.pool.request();
      
      // Add parameters
      Object.keys(params).forEach(key => {
        const param = params[key];
        if (param.output) {
          request.output(key, param.type);
        } else {
          request.input(key, param.type, param.value);
        }
      });

      const result = await request.execute(procedureName);
      return result;
    } catch (error) {
      console.error('Stored procedure execution failed:', error.message);
      console.error('Procedure:', procedureName);
      throw error;
    }
  }

  getPool() {
    return this.pool;
  }
}

// Export singleton instance
const dbConnection = new DatabaseConnection();
export default dbConnection;

// backend/src/models/User.model.js
import bcrypt from 'bcryptjs';
import sql from 'mssql';
import dbConnection from '../config/dbConnection.js';

export const User = {
  // Create new user
  create: async ({ username, email, password, role }) => {
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const query = `
      INSERT INTO users (username, email, password, role) 
      OUTPUT 
        INSERTED.id, 
        INSERTED.username, 
        INSERTED.email, 
        INSERTED.role, 
        INSERTED.created_at AS createdAt
      VALUES (@username, @email, @password, @role)
    `;
    
    await dbConnection.connect();
    const request = dbConnection.getPool().request();
    request.input('username', sql.NVarChar, username);
    request.input('email', sql.NVarChar, email);
    request.input('password', sql.NVarChar, hashedPassword);
    request.input('role', sql.NVarChar, role);
    
    const result = await request.query(query);
    return result.recordset[0];
  },

  // Find user by email or username
  findOne: async ({ email, username }) => {
    let query;
    
    await dbConnection.connect();
    const request = dbConnection.getPool().request();
    
    if (email && username) {
      query = 'SELECT * FROM users WHERE email = @email OR username = @username';
      request.input('email', sql.NVarChar, email);
      request.input('username', sql.NVarChar, username);
    } else if (email) {
      query = 'SELECT * FROM users WHERE email = @email';
      request.input('email', sql.NVarChar, email);
    } else if (username) {
      query = 'SELECT * FROM users WHERE username = @username';
      request.input('username', sql.NVarChar, username);
    }
    
    const result = await request.query(query);
    return result.recordset[0];
  },

  // Find user by ID
  findById: async (id) => {
    const query = 'SELECT id, username, email, role, created_at AS createdAt FROM users WHERE id = @id';
    
    await dbConnection.connect();
    const request = dbConnection.getPool().request();
    request.input('id', sql.Int, id);
    
    const result = await request.query(query);
    return result.recordset[0];
  },

  // Check password
  checkPassword: async (candidatePassword, hashedPassword) => {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }
};

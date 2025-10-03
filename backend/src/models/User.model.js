// backend/src/models/User.model.js
import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';

export const User = {
  // Create new user
  create: async ({ username, email, password, role }) => {
    const hashedPassword = await bcrypt.hash(password, 12);
    const query = `
      INSERT INTO users (username, email, password, role) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id, username, email, role, created_at
    `;
    const values = [username, email, hashedPassword, role];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Find user by email or username
  findOne: async ({ email, username }) => {
    let query, values;
    if (email && username) {
      query = 'SELECT * FROM users WHERE email = $1 OR username = $2';
      values = [email, username];
    } else if (email) {
      query = 'SELECT * FROM users WHERE email = $1';
      values = [email];
    } else if (username) {
      query = 'SELECT * FROM users WHERE username = $1';
      values = [username];
    }
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Find user by ID
  findById: async (id) => {
    const query = 'SELECT id, username, email, role, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Check password
  checkPassword: async (candidatePassword, hashedPassword) => {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }
};

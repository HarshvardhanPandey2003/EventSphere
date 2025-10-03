// backend/src/controllers/auth.controller.js
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model.js';

// Create JWT token
const createToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });

// Register new user
export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check for duplicate users
    const existingUser = await User.findOne({ email, username });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const user = await User.create({ username, email, password, role });

    // Generate token and set cookie
    const token = createToken(user.id);
    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.json({ 
      id: user.id, 
      username: user.username, 
      role: user.role 
    });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(400).json({ error: err.message });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body; // ✅ Extract role from request

    // Find user with password
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await User.checkPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Validate role matches
    if (user.role !== role) {
      return res.status(403).json({ 
        error: `Access denied. Please login as ${user.role}` 
      });
    }

    // Generate token and set cookie
    const token = createToken(user.id);
    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({ 
      id: user.id, 
      username: user.username, 
      role: user.role 
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(401).json({ error: err.message });
  }
};

// Logout user
export const logout = (req, res) => {
  res.clearCookie('jwt');
  res.json({ message: 'Logged out' });
};

// Test protected route
export const test = async (req, res) => {
  res.status(200).json({
    id: req.user.id,
    username: req.user.username,
    email: req.user.email,
    role: req.user.role
  });
};

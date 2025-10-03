// backend/src/middleware/auth.middleware.js
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

export const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.jwt;
  
  if (!token) {
    throw new ApiError(401, 'Authentication required');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError(401, 'User not found');
    }
    req.user = user;
    next();
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired token');
  }
});

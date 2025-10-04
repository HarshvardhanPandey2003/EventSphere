// backend/src/routes/profile.routes.js
import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  getOwnerProfile,
  updateOwnerProfile,
  deleteOwnerProfile
} from '../controllers/profile.controller.js';

const profileRouter = express.Router();

// All routes require authentication
profileRouter.use(protect);

// User profile routes
profileRouter.get('/user', getUserProfile);
profileRouter.put('/user', upload.single('avatar'), updateUserProfile);
profileRouter.delete('/user', deleteUserProfile);

// Owner profile routes
profileRouter.get('/owner', getOwnerProfile);
profileRouter.put('/owner', upload.single('avatar'), updateOwnerProfile);
profileRouter.delete('/owner', deleteOwnerProfile);

export default profileRouter;

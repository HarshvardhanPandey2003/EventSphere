// backend/src/routes/event.routes.js
import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import {
  getAllEvents,           
  getRegisteredEvents,    
  getOwnerEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent
} from '../controllers/event.controller.js';

const eventRouter = express.Router();

// All routes require authentication
eventRouter.use(protect);

// Public event routes (must come before /:id routes)
eventRouter.get('/', getAllEvents);              
eventRouter.get('/registered', getRegisteredEvents);
eventRouter.get('/owner', getOwnerEvents);

// Event management
eventRouter.post('/', upload.single('image'), createEvent);

// Event detail routes
eventRouter.get('/:id', getEventById);
eventRouter.put('/:id', upload.single('image'), updateEvent);
eventRouter.delete('/:id', deleteEvent);

// Attendee routes
eventRouter.post('/:id/register', registerForEvent);
eventRouter.delete('/:id/unregister', unregisterFromEvent);

export default eventRouter;

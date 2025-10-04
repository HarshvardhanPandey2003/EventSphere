// backend/src/controllers/event.controller.js
import { Event } from '../models/Event.model.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all events for owner
export const getOwnerEvents = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const events = await Event.findByOwner(ownerId);
    res.json(events);
  } catch (err) {
    console.error('Get owner events error:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

// Get single event by ID
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // REMOVE THE ACCESS RESTRICTION - Allow all authenticated users to view events
    // Users need to see event details before they can register
    
    // Optional: Add a flag to indicate if the current user is the owner or registered
    const isOwner = event.ownerId === req.user.id;
    const isAttendee = event.attendees.some(a => a.userId === req.user.id);
    
    // Include this info in the response
    res.json({
      ...event,
      isOwner,
      isAttendee
    });
  } catch (err) {
    console.error('Get event error:', err);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};
// Create new event
export const createEvent = async (req, res) => {
  try {
    const { title, description, startDate, endDate, location, capacity } = req.body;
    const ownerId = req.user.id;

    // Validation
    if (!title || !description || !startDate || !endDate || !location || !capacity) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check dates
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    // Get image path if uploaded
    const image = req.file ? `/uploads/events/${req.file.filename}` : null;

    const event = await Event.create({
      title,
      description,
      startDate,
      endDate,
      location,
      capacity: parseInt(capacity),
      image,
      ownerId
    });

    res.status(201).json(event);
  } catch (err) {
    console.error('Create event error:', err);
    res.status(500).json({ error: 'Failed to create event' });
  }
};

// Update event
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check ownership
    if (event.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this event' });
    }

    const updateData = { ...req.body };

    // Handle new image upload
    if (req.file) {
      // Delete old image if exists
      if (event.image) {
        const oldImagePath = path.join(__dirname, '../../', event.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.image = `/uploads/events/${req.file.filename}`;
    }

    const updatedEvent = await Event.update(id, updateData);
    res.json(updatedEvent);
  } catch (err) {
    console.error('Update event error:', err);
    res.status(500).json({ error: 'Failed to update event' });
  }
};

// Delete event
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check ownership
    if (event.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this event' });
    }

    // Delete image file if exists
    if (event.image) {
      const imagePath = path.join(__dirname, '../../', event.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Event.delete(id);
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Delete event error:', err);
    res.status(500).json({ error: 'Failed to delete event' });
  }
};

// Register for event
export const registerForEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if event is full
    if (event.attendees.length >= event.capacity) {
      return res.status(400).json({ error: 'Event is full' });
    }

    // Check if already registered
    if (event.attendees.some(a => a.userId === userId)) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }

    await Event.registerAttendee(id, userId);
    const updatedEvent = await Event.findById(id);
    
    res.json(updatedEvent);
  } catch (err) {
    console.error('Register event error:', err);
    res.status(500).json({ error: 'Failed to register for event' });
  }
};

// Unregister from event
export const unregisterFromEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    await Event.unregisterAttendee(id, userId);
    const updatedEvent = await Event.findById(id);
    
    res.json(updatedEvent);
  } catch (err) {
    console.error('Unregister event error:', err);
    res.status(500).json({ error: 'Failed to unregister from event' });
  }
};
// Get all events (available for registration)
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.findAll();
    res.json(events);
  } catch (err) {
    console.error('Get all events error:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

// ADD THIS: Get events user has registered for
export const getRegisteredEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const events = await Event.findByAttendee(userId);
    res.json(events);
  } catch (err) {
    console.error('Get registered events error:', err);
    res.status(500).json({ error: 'Failed to fetch registered events' });
  }
};

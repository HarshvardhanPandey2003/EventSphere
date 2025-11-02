// backend/src/controllers/event.controller.js
import { Event } from '../models/Event.model.js';
import { replaceImage, deleteBlob } from '../utils/blobStorage.util.js';

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

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const isOwner = event.ownerId === req.user.id;
    const isAttendee = event.attendees.some(a => a.userId === req.user.id);
    
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

export const createEvent = async (req, res) => {
  try {
    const { title, description, startDate, endDate, location, capacity, deadline } = req.body;
    const ownerId = req.user.id;

    if (!title || !description || !startDate || !endDate || !location || !capacity || !deadline) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    if (new Date(deadline) >= new Date(startDate)) {
      return res.status(400).json({ error: 'Registration deadline must be before event start date' });
    }

    // ✅ Upload image (no old image to replace)
    const image = await replaceImage(req.file, null, 'event');

    const event = await Event.create({
      title,
      description,
      startDate,
      endDate,
      location,
      capacity: parseInt(capacity),
      deadline,
      image,
      ownerId
    });

    res.status(201).json(event);
  } catch (err) {
    console.error('Create event error:', err);
    res.status(500).json({ error: 'Failed to create event' });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this event' });
    }

    const updateData = { ...req.body };

    if (updateData.deadline && updateData.startDate) {
      if (new Date(updateData.deadline) >= new Date(updateData.startDate)) {
        return res.status(400).json({ error: 'Registration deadline must be before event start date' });
      }
    } else if (updateData.deadline && !updateData.startDate) {
      if (new Date(updateData.deadline) >= new Date(event.startDate)) {
        return res.status(400).json({ error: 'Registration deadline must be before event start date' });
      }
    }

    // ✅ Replace image if new file uploaded
    if (req.file) {
      const newImageUrl = await replaceImage(req.file, event.image, 'event');
      updateData.image = newImageUrl;
    }

    const updatedEvent = await Event.update(id, updateData);
    res.json(updatedEvent);
  } catch (err) {
    console.error('Update event error:', err);
    res.status(500).json({ error: 'Failed to update event' });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this event' });
    }

    if (event.image) {
      await deleteBlob(event.image);
    }

    await Event.delete(id);
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Delete event error:', err);
    res.status(500).json({ error: 'Failed to delete event' });
  }
};

export const registerForEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (new Date() > new Date(event.deadline)) {
      return res.status(400).json({ error: 'Registration deadline has passed' });
    }

    if (event.attendees.length >= event.capacity) {
      return res.status(400).json({ error: 'Event is full' });
    }

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

export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.findAll();
    res.json(events);
  } catch (err) {
    console.error('Get all events error:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

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

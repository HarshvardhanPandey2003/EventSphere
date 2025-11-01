// backend/src/models/Event.model.js
import sql from 'mssql';
import dbConnection from '../config/dbConnection.js';

export const Event = {
  // Create new event
  create: async ({ title, description, startDate, endDate, location, capacity, deadline, image, ownerId }) => {
    const query = `
      INSERT INTO events (title, description, start_date, end_date, location, capacity, deadline, image, owner_id) 
      OUTPUT 
        INSERTED.id, 
        INSERTED.title, 
        INSERTED.description, 
        INSERTED.start_date AS startDate, 
        INSERTED.end_date AS endDate, 
        INSERTED.location, 
        INSERTED.capacity, 
        INSERTED.deadline,
        INSERTED.status, 
        INSERTED.image, 
        INSERTED.owner_id AS ownerId, 
        INSERTED.created_at AS createdAt
      VALUES (@title, @description, @startDate, @endDate, @location, @capacity, @deadline, @image, @ownerId)
    `;
    
    await dbConnection.connect();
    const request = dbConnection.getPool().request();
    request.input('title', sql.NVarChar, title);
    request.input('description', sql.NVarChar, description);
    request.input('startDate', sql.DateTime, startDate);
    request.input('endDate', sql.DateTime, endDate);
    request.input('location', sql.NVarChar, location);
    request.input('capacity', sql.Int, capacity);
    request.input('deadline', sql.DateTime, deadline);
    request.input('image', sql.NVarChar, image);
    request.input('ownerId', sql.Int, ownerId);
    
    const result = await request.query(query);
    return result.recordset[0];
  },

  // Find all events with attendees (using FOR JSON AUTO)
  findAll: async () => {
    const query = `
      SELECT 
        e.id,
        e.title,
        e.description,
        e.start_date AS startDate,
        e.end_date AS endDate,
        e.location,
        e.capacity,
        e.deadline,
        e.status,
        e.image,
        e.owner_id AS ownerId,
        e.created_at AS createdAt,
        u.username AS ownerName,
        u.email AS ownerEmail,
        (
          SELECT 
            ea.user_id AS userId,
            au.username,
            au.email,
            ea.registered_at AS registeredAt
          FROM event_attendees ea
          INNER JOIN users au ON ea.user_id = au.id
          WHERE ea.event_id = e.id
          FOR JSON PATH
        ) AS attendees
      FROM events e
      LEFT JOIN users u ON e.owner_id = u.id
      ORDER BY e.start_date ASC
    `;
    
    await dbConnection.connect();
    const result = await dbConnection.query(query);
    
    return result.map(event => ({
      ...event,
      attendees: event.attendees ? JSON.parse(event.attendees) : []
    }));
  },

  // Find events by attendee
  findByAttendee: async (userId) => {
    const query = `
      SELECT 
        e.id,
        e.title,
        e.description,
        e.start_date AS startDate,
        e.end_date AS endDate,
        e.location,
        e.capacity,
        e.deadline,
        e.status,
        e.image,
        e.owner_id AS ownerId,
        e.created_at AS createdAt,
        u.username AS ownerName,
        u.email AS ownerEmail,
        (
          SELECT 
            ea.user_id AS userId,
            au.username,
            au.email,
            ea.registered_at AS registeredAt
          FROM event_attendees ea
          INNER JOIN users au ON ea.user_id = au.id
          WHERE ea.event_id = e.id
          FOR JSON PATH
        ) AS attendees
      FROM events e
      LEFT JOIN users u ON e.owner_id = u.id
      WHERE e.id IN (
        SELECT event_id FROM event_attendees WHERE user_id = @userId
      )
      ORDER BY e.start_date ASC
    `;
    
    await dbConnection.connect();
    const request = dbConnection.getPool().request();
    request.input('userId', sql.Int, userId);
    
    const result = await request.query(query);
    
    return result.recordset.map(event => ({
      ...event,
      attendees: event.attendees ? JSON.parse(event.attendees) : []
    }));
  },

  // Find events by owner
  findByOwner: async (ownerId) => {
    const query = `
      SELECT 
        e.id,
        e.title,
        e.description,
        e.start_date AS startDate,
        e.end_date AS endDate,
        e.location,
        e.capacity,
        e.deadline,
        e.status,
        e.image,
        e.owner_id AS ownerId,
        e.created_at AS createdAt,
        (SELECT COUNT(*) FROM event_attendees WHERE event_id = e.id) AS attendee_count,
        (
          SELECT 
            ea.user_id AS userId,
            au.username,
            au.email,
            ea.registered_at AS registeredAt
          FROM event_attendees ea
          INNER JOIN users au ON ea.user_id = au.id
          WHERE ea.event_id = e.id
          FOR JSON PATH
        ) AS attendees
      FROM events e
      WHERE e.owner_id = @ownerId
      ORDER BY e.created_at DESC
    `;
    
    await dbConnection.connect();
    const request = dbConnection.getPool().request();
    request.input('ownerId', sql.Int, ownerId);
    
    const result = await request.query(query);
    
    return result.recordset.map(event => ({
      ...event,
      attendees: event.attendees ? JSON.parse(event.attendees) : []
    }));
  },

  // Find event by ID
  findById: async (eventId) => {
    const query = `
      SELECT 
        e.id,
        e.title,
        e.description,
        e.start_date AS startDate,
        e.end_date AS endDate,
        e.location,
        e.capacity,
        e.deadline,
        e.status,
        e.image,
        e.owner_id AS ownerId,
        e.created_at AS createdAt,
        u.username AS ownerName,
        u.email AS ownerEmail,
        (
          SELECT 
            ea.user_id AS userId,
            au.username,
            au.email,
            ea.registered_at AS registeredAt
          FROM event_attendees ea
          INNER JOIN users au ON ea.user_id = au.id
          WHERE ea.event_id = e.id
          FOR JSON PATH
        ) AS attendees
      FROM events e
      LEFT JOIN users u ON e.owner_id = u.id
      WHERE e.id = @eventId
    `;
    
    await dbConnection.connect();
    const request = dbConnection.getPool().request();
    request.input('eventId', sql.Int, eventId);
    
    const result = await request.query(query);
    
    if (result.recordset.length === 0) return null;
    
    const event = result.recordset[0];
    return {
      ...event,
      attendees: event.attendees ? JSON.parse(event.attendees) : []
    };
  },

  // Update event
  update: async (eventId, updateData) => {
    const { title, description, startDate, endDate, location, capacity, deadline, status, image } = updateData;
    
    const fields = [];
    const params = {};


    if (title !== undefined) {
      fields.push('title = @title');
      params.title = { type: sql.NVarChar, value: title };
    }
    if (description !== undefined) {
      fields.push('description = @description');
      params.description = { type: sql.NVarChar, value: description };
    }
    if (startDate !== undefined) {
      fields.push('start_date = @startDate');
      params.startDate = { type: sql.DateTime, value: startDate };
    }
    if (endDate !== undefined) {
      fields.push('end_date = @endDate');
      params.endDate = { type: sql.DateTime, value: endDate };
    }
    if (location !== undefined) {
      fields.push('location = @location');
      params.location = { type: sql.NVarChar, value: location };
    }
    if (capacity !== undefined) {
      fields.push('capacity = @capacity');
      params.capacity = { type: sql.Int, value: capacity };
    }
    if (deadline !== undefined) {
      fields.push('deadline = @deadline');
      params.deadline = { type: sql.DateTime, value: deadline };
    }
    if (status !== undefined) {
      fields.push('status = @status');
      params.status = { type: sql.NVarChar, value: status };
    }
    if (image !== undefined) {
      fields.push('image = @image');
      params.image = { type: sql.NVarChar, value: image };
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');

    const query = `
      UPDATE events 
      SET ${fields.join(', ')} 
      OUTPUT 
        INSERTED.id, 
        INSERTED.title, 
        INSERTED.description, 
        INSERTED.start_date AS startDate, 
        INSERTED.end_date AS endDate, 
        INSERTED.location, 
        INSERTED.capacity, 
        INSERTED.deadline,
        INSERTED.status, 
        INSERTED.image, 
        INSERTED.owner_id AS ownerId, 
        INSERTED.updated_at AS updatedAt
      WHERE id = @eventId
    `;

    await dbConnection.connect();
    const request = dbConnection.getPool().request();
    request.input('eventId', sql.Int, eventId);
    
    Object.keys(params).forEach(key => {
      request.input(key, params[key].type, params[key].value);
    });

    const result = await request.query(query);
    return result.recordset[0];
  },

  // Delete event
  delete: async (eventId) => {
    const query = `
      DELETE FROM events 
      OUTPUT DELETED.id
      WHERE id = @eventId
    `;
    
    await dbConnection.connect();
    const request = dbConnection.getPool().request();
    request.input('eventId', sql.Int, eventId);
    
    const result = await request.query(query);
    return result.recordset[0];
  },

  // Register attendee
  registerAttendee: async (eventId, userId) => {
    const query = `
      IF NOT EXISTS (SELECT 1 FROM event_attendees WHERE event_id = @eventId AND user_id = @userId)
      BEGIN
        INSERT INTO event_attendees (event_id, user_id) 
        OUTPUT 
          INSERTED.event_id AS eventId, 
          INSERTED.user_id AS userId, 
          INSERTED.registered_at AS registeredAt
        VALUES (@eventId, @userId)
      END
    `;
    
    await dbConnection.connect();
    const request = dbConnection.getPool().request();
    request.input('eventId', sql.Int, eventId);
    request.input('userId', sql.Int, userId);
    
    const result = await request.query(query);
    return result.recordset[0];
  },

  // Unregister attendee
  unregisterAttendee: async (eventId, userId) => {
    const query = `
      DELETE FROM event_attendees 
      OUTPUT 
        DELETED.event_id AS eventId, 
        DELETED.user_id AS userId
      WHERE event_id = @eventId AND user_id = @userId
    `;
    
    await dbConnection.connect();
    const request = dbConnection.getPool().request();
    request.input('eventId', sql.Int, eventId);
    request.input('userId', sql.Int, userId);
    
    const result = await request.query(query);
    return result.recordset[0];
  }
};

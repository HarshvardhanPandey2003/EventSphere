// backend/src/models/Event.model.js
import { pool } from '../config/db.js';

export const Event = {
  // Create new event
  create: async ({ title, description, startDate, endDate, location, capacity, deadline, image, ownerId }) => {
    const query = `
      INSERT INTO events (title, description, start_date, end_date, location, capacity, deadline, image, owner_id) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING 
        id, 
        title, 
        description, 
        start_date AS "startDate", 
        end_date AS "endDate", 
        location, 
        capacity, 
        deadline,
        status, 
        image, 
        owner_id AS "ownerId", 
        created_at AS "createdAt"
    `;
    const values = [title, description, startDate, endDate, location, capacity, deadline, image, ownerId];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Find all events (for browsing)
  findAll: async () => {
    const query = `
      SELECT 
        e.id,
        e.title,
        e.description,
        e.start_date AS "startDate",
        e.end_date AS "endDate",
        e.location,
        e.capacity,
        e.deadline,
        e.status,
        e.image,
        e.owner_id AS "ownerId",
        e.created_at AS "createdAt",
        u.username AS "ownerName",
        u.email AS "ownerEmail",
        COALESCE(
          json_agg(
            json_build_object(
              'userId', ea.user_id,
              'username', au.username,
              'email', au.email,
              'registeredAt', ea.registered_at
            )
          ) FILTER (WHERE ea.user_id IS NOT NULL), 
          '[]'::json
        ) AS attendees
      FROM events e
      LEFT JOIN users u ON e.owner_id = u.id
      LEFT JOIN event_attendees ea ON e.id = ea.event_id
      LEFT JOIN users au ON ea.user_id = au.id
      GROUP BY e.id, u.username, u.email
      ORDER BY e.start_date ASC
    `;
    const result = await pool.query(query);
    
    return result.rows.map(event => ({
      ...event,
      attendees: Array.isArray(event.attendees) ? event.attendees : []
    }));
  },

  // Find events by attendee (user's registered events)
  findByAttendee: async (userId) => {
    const query = `
      SELECT 
        e.id,
        e.title,
        e.description,
        e.start_date AS "startDate",
        e.end_date AS "endDate",
        e.location,
        e.capacity,
        e.deadline,
        e.status,
        e.image,
        e.owner_id AS "ownerId",
        e.created_at AS "createdAt",
        u.username AS "ownerName",
        u.email AS "ownerEmail",
        COALESCE(
          json_agg(
            json_build_object(
              'userId', ea.user_id,
              'username', au.username,
              'email', au.email,
              'registeredAt', ea.registered_at
            )
          ) FILTER (WHERE ea.user_id IS NOT NULL), 
          '[]'::json
        ) AS attendees
      FROM events e
      LEFT JOIN users u ON e.owner_id = u.id
      LEFT JOIN event_attendees ea ON e.id = ea.event_id
      LEFT JOIN users au ON ea.user_id = au.id
      WHERE e.id IN (
        SELECT event_id FROM event_attendees WHERE user_id = $1
      )
      GROUP BY e.id, u.username, u.email
      ORDER BY e.start_date ASC
    `;
    const result = await pool.query(query, [userId]);
    
    return result.rows.map(event => ({
      ...event,
      attendees: Array.isArray(event.attendees) ? event.attendees : []
    }));
  },

  // Find all events by owner with attendee count
  findByOwner: async (ownerId) => {
    const query = `
      SELECT 
        e.id,
        e.title,
        e.description,
        e.start_date AS "startDate",
        e.end_date AS "endDate",
        e.location,
        e.capacity,
        e.deadline,
        e.status,
        e.image,
        e.owner_id AS "ownerId",
        e.created_at AS "createdAt",
        COALESCE(COUNT(ea.user_id), 0)::integer AS attendee_count,
        COALESCE(
          json_agg(
            json_build_object(
              'userId', ea.user_id,
              'username', au.username,
              'email', au.email,
              'registeredAt', ea.registered_at
            )
          ) FILTER (WHERE ea.user_id IS NOT NULL), 
          '[]'::json
        ) AS attendees
      FROM events e
      LEFT JOIN event_attendees ea ON e.id = ea.event_id
      LEFT JOIN users au ON ea.user_id = au.id
      WHERE e.owner_id = $1
      GROUP BY e.id
      ORDER BY e.created_at DESC
    `;
    const result = await pool.query(query, [ownerId]);
    
    return result.rows.map(event => ({
      ...event,
      attendees: Array.isArray(event.attendees) ? event.attendees : []
    }));
  },

  // Find event by ID with attendees
  findById: async (eventId) => {
    const query = `
      SELECT 
        e.id,
        e.title,
        e.description,
        e.start_date AS "startDate",
        e.end_date AS "endDate",
        e.location,
        e.capacity,
        e.deadline,
        e.status,
        e.image,
        e.owner_id AS "ownerId",
        e.created_at AS "createdAt",
        u.username AS "ownerName",
        u.email AS "ownerEmail",
        COALESCE(
          json_agg(
            json_build_object(
              'userId', ea.user_id,
              'username', au.username,
              'email', au.email,
              'registeredAt', ea.registered_at
            )
          ) FILTER (WHERE ea.user_id IS NOT NULL), 
          '[]'::json
        ) AS attendees
      FROM events e
      LEFT JOIN users u ON e.owner_id = u.id
      LEFT JOIN event_attendees ea ON e.id = ea.event_id
      LEFT JOIN users au ON ea.user_id = au.id
      WHERE e.id = $1
      GROUP BY e.id, u.username, u.email
    `;
    const result = await pool.query(query, [eventId]);
    if (result.rows.length === 0) return null;
    
    const event = result.rows[0];
    return {
      ...event,
      attendees: Array.isArray(event.attendees) ? event.attendees : []
    };
  },

  // Update event
  update: async (eventId, updateData) => {
    const { title, description, startDate, endDate, location, capacity, deadline, status, image } = updateData;
    
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (title !== undefined) {
      fields.push(`title = $${paramIndex++}`);
      values.push(title);
    }
    if (description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    if (startDate !== undefined) {
      fields.push(`start_date = $${paramIndex++}`);
      values.push(startDate);
    }
    if (endDate !== undefined) {
      fields.push(`end_date = $${paramIndex++}`);
      values.push(endDate);
    }
    if (location !== undefined) {
      fields.push(`location = $${paramIndex++}`);
      values.push(location);
    }
    if (capacity !== undefined) {
      fields.push(`capacity = $${paramIndex++}`);
      values.push(capacity);
    }
    if (deadline !== undefined) {
      fields.push(`deadline = $${paramIndex++}`);
      values.push(deadline);
    }
    if (status !== undefined) {
      fields.push(`status = $${paramIndex++}`);
      values.push(status);
    }
    if (image !== undefined) {
      fields.push(`image = $${paramIndex++}`);
      values.push(image);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(eventId);

    const query = `
      UPDATE events 
      SET ${fields.join(', ')} 
      WHERE id = $${paramIndex}
      RETURNING 
        id, 
        title, 
        description, 
        start_date AS "startDate", 
        end_date AS "endDate", 
        location, 
        capacity, 
        deadline,
        status, 
        image, 
        owner_id AS "ownerId", 
        updated_at AS "updatedAt"
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Delete event
  delete: async (eventId) => {
    const query = 'DELETE FROM events WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [eventId]);
    return result.rows[0];
  },

  // Register attendee
  registerAttendee: async (eventId, userId) => {
    const query = `
      INSERT INTO event_attendees (event_id, user_id) 
      VALUES ($1, $2) 
      ON CONFLICT (event_id, user_id) DO NOTHING
      RETURNING event_id AS "eventId", user_id AS "userId", registered_at AS "registeredAt"
    `;
    const result = await pool.query(query, [eventId, userId]);
    return result.rows[0];
  },

  // Unregister attendee
  unregisterAttendee: async (eventId, userId) => {
    const query = `
      DELETE FROM event_attendees 
      WHERE event_id = $1 AND user_id = $2 
      RETURNING event_id AS "eventId", user_id AS "userId"
    `;
    const result = await pool.query(query, [eventId, userId]);
    return result.rows[0];
  }
};

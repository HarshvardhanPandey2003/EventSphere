// backend/src/models/Profile.model.js
import { pool } from '../config/db.js';

export const UserProfile = {
  // Create user profile
  create: async (userId, profileData) => {
    const { bio, phone, dateOfBirth, avatar, location, interests, socialLinks } = profileData;
    
    const query = `
      INSERT INTO user_profiles 
        (user_id, bio, phone, date_of_birth, avatar, location, interests, social_links) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING 
        id,
        user_id AS "userId",
        bio,
        phone,
        date_of_birth AS "dateOfBirth",
        avatar,
        location,
        interests,
        social_links AS "socialLinks",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `;
    
    const values = [
      userId,
      bio || null,
      phone || null,
      dateOfBirth || null,
      avatar || null,
      location || null,
      interests || [],
      socialLinks || {}
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Find profile by user ID
  findByUserId: async (userId) => {
    const query = `
      SELECT 
        up.id,
        up.user_id AS "userId",
        up.bio,
        up.phone,
        up.date_of_birth AS "dateOfBirth",
        up.avatar,
        up.location,
        up.interests,
        up.social_links AS "socialLinks",
        up.created_at AS "createdAt",
        up.updated_at AS "updatedAt",
        u.username,
        u.email,
        u.role
      FROM user_profiles up
      JOIN users u ON up.user_id = u.id
      WHERE up.user_id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  },

  // Update profile
  update: async (userId, updateData) => {
    const { bio, phone, dateOfBirth, avatar, location, interests, socialLinks } = updateData;
    
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (bio !== undefined) {
      fields.push(`bio = $${paramIndex++}`);
      values.push(bio);
    }
    if (phone !== undefined) {
      fields.push(`phone = $${paramIndex++}`);
      values.push(phone);
    }
    if (dateOfBirth !== undefined) {
      fields.push(`date_of_birth = $${paramIndex++}`);
      values.push(dateOfBirth);
    }
    if (avatar !== undefined) {
      fields.push(`avatar = $${paramIndex++}`);
      values.push(avatar);
    }
    if (location !== undefined) {
      fields.push(`location = $${paramIndex++}`);
      values.push(location);
    }
    if (interests !== undefined) {
      fields.push(`interests = $${paramIndex++}`);
      values.push(interests);
    }
    if (socialLinks !== undefined) {
      fields.push(`social_links = $${paramIndex++}`);
      values.push(socialLinks);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(userId);

    const query = `
      UPDATE user_profiles 
      SET ${fields.join(', ')} 
      WHERE user_id = $${paramIndex}
      RETURNING 
        id,
        user_id AS "userId",
        bio,
        phone,
        date_of_birth AS "dateOfBirth",
        avatar,
        location,
        interests,
        social_links AS "socialLinks",
        updated_at AS "updatedAt"
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Delete profile
  delete: async (userId) => {
    const query = 'DELETE FROM user_profiles WHERE user_id = $1 RETURNING id';
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }
};

export const OwnerProfile = {
  // Create owner profile
  create: async (userId, profileData) => {
    const { companyName, bio, phone, website, avatar, businessType, location, socialLinks } = profileData;
    
    const query = `
      INSERT INTO owner_profiles 
        (user_id, company_name, bio, phone, website, avatar, business_type, location, social_links) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING 
        id,
        user_id AS "userId",
        company_name AS "companyName",
        bio,
        phone,
        website,
        avatar,
        business_type AS "businessType",
        location,
        social_links AS "socialLinks",
        verification_status AS "verificationStatus",
        total_events AS "totalEvents",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `;
    
    const values = [
      userId,
      companyName || null,
      bio || null,
      phone || null,
      website || null,
      avatar || null,
      businessType || null,
      location || null,
      socialLinks || {}
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Find profile by user ID with event count
  findByUserId: async (userId) => {
    const query = `
      SELECT 
        op.id,
        op.user_id AS "userId",
        op.company_name AS "companyName",
        op.bio,
        op.phone,
        op.website,
        op.avatar,
        op.business_type AS "businessType",
        op.location,
        op.social_links AS "socialLinks",
        op.verification_status AS "verificationStatus",
        op.created_at AS "createdAt",
        op.updated_at AS "updatedAt",
        u.username,
        u.email,
        u.role,
        COUNT(e.id) AS "totalEvents"
      FROM owner_profiles op
      JOIN users u ON op.user_id = u.id
      LEFT JOIN events e ON e.owner_id = u.id
      WHERE op.user_id = $1
      GROUP BY op.id, u.id
    `;
    
    const result = await pool.query(query, [userId]);
    if (result.rows.length === 0) return null;
    
    return {
      ...result.rows[0],
      totalEvents: parseInt(result.rows[0].totalEvents) || 0
    };
  },

  // Update profile
  update: async (userId, updateData) => {
    const { companyName, bio, phone, website, avatar, businessType, location, socialLinks } = updateData;
    
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (companyName !== undefined) {
      fields.push(`company_name = $${paramIndex++}`);
      values.push(companyName);
    }
    if (bio !== undefined) {
      fields.push(`bio = $${paramIndex++}`);
      values.push(bio);
    }
    if (phone !== undefined) {
      fields.push(`phone = $${paramIndex++}`);
      values.push(phone);
    }
    if (website !== undefined) {
      fields.push(`website = $${paramIndex++}`);
      values.push(website);
    }
    if (avatar !== undefined) {
      fields.push(`avatar = $${paramIndex++}`);
      values.push(avatar);
    }
    if (businessType !== undefined) {
      fields.push(`business_type = $${paramIndex++}`);
      values.push(businessType);
    }
    if (location !== undefined) {
      fields.push(`location = $${paramIndex++}`);
      values.push(location);
    }
    if (socialLinks !== undefined) {
      fields.push(`social_links = $${paramIndex++}`);
      values.push(socialLinks);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(userId);

    const query = `
      UPDATE owner_profiles 
      SET ${fields.join(', ')} 
      WHERE user_id = $${paramIndex}
      RETURNING 
        id,
        user_id AS "userId",
        company_name AS "companyName",
        bio,
        phone,
        website,
        avatar,
        business_type AS "businessType",
        location,
        social_links AS "socialLinks",
        verification_status AS "verificationStatus",
        updated_at AS "updatedAt"
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Update total events count
  updateEventCount: async (userId) => {
    const query = `
      UPDATE owner_profiles 
      SET total_events = (
        SELECT COUNT(*) FROM events WHERE owner_id = $1
      )
      WHERE user_id = $1
      RETURNING total_events AS "totalEvents"
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  },

  // Delete profile
  delete: async (userId) => {
    const query = 'DELETE FROM owner_profiles WHERE user_id = $1 RETURNING id';
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }
};

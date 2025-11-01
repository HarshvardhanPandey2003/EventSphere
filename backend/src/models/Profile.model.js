// backend/src/models/Profile.model.js
import sql from 'mssql';
import dbConnection from '../config/dbConnection.js';

export const UserProfile = {
  // Create user profile
  create: async (userId, profileData) => {
    const { bio, phone, dateOfBirth, avatar, location, interests, socialLinks } = profileData;
    
    const query = `
      INSERT INTO user_profiles 
        (user_id, bio, phone, date_of_birth, avatar, location, interests, social_links) 
      OUTPUT 
        INSERTED.id,
        INSERTED.user_id AS userId,
        INSERTED.bio,
        INSERTED.phone,
        INSERTED.date_of_birth AS dateOfBirth,
        INSERTED.avatar,
        INSERTED.location,
        INSERTED.interests,
        INSERTED.social_links AS socialLinks,
        INSERTED.created_at AS createdAt,
        INSERTED.updated_at AS updatedAt
      VALUES (@userId, @bio, @phone, @dateOfBirth, @avatar, @location, @interests, @socialLinks)
    `;
    
    await dbConnection.connect();
    const request = dbConnection.getPool().request();
    request.input('userId', sql.Int, userId);
    request.input('bio', sql.NVarChar, bio || null);
    request.input('phone', sql.NVarChar, phone || null);
    request.input('dateOfBirth', sql.Date, dateOfBirth || null);
    request.input('avatar', sql.NVarChar, avatar || null);
    request.input('location', sql.NVarChar, location || null);
    request.input('interests', sql.NVarChar, JSON.stringify(interests || []));
    request.input('socialLinks', sql.NVarChar, JSON.stringify(socialLinks || {}));
    
    const result = await request.query(query);
    const profile = result.recordset[0];
    
    return {
      ...profile,
      interests: profile.interests ? JSON.parse(profile.interests) : [],
      socialLinks: profile.socialLinks ? JSON.parse(profile.socialLinks) : {}
    };
  },

  // Find profile by user ID
  findByUserId: async (userId) => {
    const query = `
      SELECT 
        up.id,
        up.user_id AS userId,
        up.bio,
        up.phone,
        up.date_of_birth AS dateOfBirth,
        up.avatar,
        up.location,
        up.interests,
        up.social_links AS socialLinks,
        up.created_at AS createdAt,
        up.updated_at AS updatedAt,
        u.username,
        u.email,
        u.role
      FROM user_profiles up
      JOIN users u ON up.user_id = u.id
      WHERE up.user_id = @userId
    `;
    
    await dbConnection.connect();
    const request = dbConnection.getPool().request();
    request.input('userId', sql.Int, userId);
    
    const result = await request.query(query);
    if (result.recordset.length === 0) return null;
    
    const profile = result.recordset[0];
    return {
      ...profile,
      interests: profile.interests ? JSON.parse(profile.interests) : [],
      socialLinks: profile.socialLinks ? JSON.parse(profile.socialLinks) : {}
    };
  },

  // Update profile
  update: async (userId, updateData) => {
    const { bio, phone, dateOfBirth, avatar, location, interests, socialLinks } = updateData;
    
    const fields = [];
    const params = {};

    if (bio !== undefined) {
      fields.push('bio = @bio');
      params.bio = { type: sql.NVarChar, value: bio };
    }
    if (phone !== undefined) {
      fields.push('phone = @phone');
      params.phone = { type: sql.NVarChar, value: phone };
    }
    if (dateOfBirth !== undefined) {
      fields.push('date_of_birth = @dateOfBirth');
      params.dateOfBirth = { type: sql.Date, value: dateOfBirth };
    }
    if (avatar !== undefined) {
      fields.push('avatar = @avatar');
      params.avatar = { type: sql.NVarChar, value: avatar };
    }
    if (location !== undefined) {
      fields.push('location = @location');
      params.location = { type: sql.NVarChar, value: location };
    }
    if (interests !== undefined) {
      fields.push('interests = @interests');
      params.interests = { type: sql.NVarChar, value: JSON.stringify(interests) };
    }
    if (socialLinks !== undefined) {
      fields.push('social_links = @socialLinks');
      params.socialLinks = { type: sql.NVarChar, value: JSON.stringify(socialLinks) };
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');

    const query = `
      UPDATE user_profiles 
      SET ${fields.join(', ')} 
      OUTPUT 
        INSERTED.id,
        INSERTED.user_id AS userId,
        INSERTED.bio,
        INSERTED.phone,
        INSERTED.date_of_birth AS dateOfBirth,
        INSERTED.avatar,
        INSERTED.location,
        INSERTED.interests,
        INSERTED.social_links AS socialLinks,
        INSERTED.updated_at AS updatedAt
      WHERE user_id = @userId
    `;

    await dbConnection.connect();
    const request = dbConnection.getPool().request();
    request.input('userId', sql.Int, userId);
    
    Object.keys(params).forEach(key => {
      request.input(key, params[key].type, params[key].value);
    });

    const result = await request.query(query);
    const profile = result.recordset[0];
    
    return {
      ...profile,
      interests: profile.interests ? JSON.parse(profile.interests) : [],
      socialLinks: profile.socialLinks ? JSON.parse(profile.socialLinks) : {}
    };
  },

  // Delete profile
  delete: async (userId) => {
    const query = `
      DELETE FROM user_profiles 
      OUTPUT DELETED.id
      WHERE user_id = @userId
    `;
    
    await dbConnection.connect();
    const request = dbConnection.getPool().request();
    request.input('userId', sql.Int, userId);
    
    const result = await request.query(query);
    return result.recordset[0];
  }
};

export const OwnerProfile = {
  // Create owner profile
  create: async (userId, profileData) => {
    const { companyName, bio, phone, website, avatar, businessType, location, socialLinks } = profileData;
    
    const query = `
      INSERT INTO owner_profiles 
        (user_id, company_name, bio, phone, website, avatar, business_type, location, social_links) 
      OUTPUT 
        INSERTED.id,
        INSERTED.user_id AS userId,
        INSERTED.company_name AS companyName,
        INSERTED.bio,
        INSERTED.phone,
        INSERTED.website,
        INSERTED.avatar,
        INSERTED.business_type AS businessType,
        INSERTED.location,
        INSERTED.social_links AS socialLinks,
        INSERTED.verification_status AS verificationStatus,
        INSERTED.total_events AS totalEvents,
        INSERTED.created_at AS createdAt,
        INSERTED.updated_at AS updatedAt
      VALUES (@userId, @companyName, @bio, @phone, @website, @avatar, @businessType, @location, @socialLinks)
    `;
    
    await dbConnection.connect();
    const request = dbConnection.getPool().request();
    request.input('userId', sql.Int, userId);
    request.input('companyName', sql.NVarChar, companyName || null);
    request.input('bio', sql.NVarChar, bio || null);
    request.input('phone', sql.NVarChar, phone || null);
    request.input('website', sql.NVarChar, website || null);
    request.input('avatar', sql.NVarChar, avatar || null);
    request.input('businessType', sql.NVarChar, businessType || null);
    request.input('location', sql.NVarChar, location || null);
    request.input('socialLinks', sql.NVarChar, JSON.stringify(socialLinks || {}));
    
    const result = await request.query(query);
    const profile = result.recordset[0];
    
    return {
      ...profile,
      socialLinks: profile.socialLinks ? JSON.parse(profile.socialLinks) : {}
    };
  },

  // Find profile by user ID with event count
  findByUserId: async (userId) => {
    const query = `
      SELECT 
        op.id,
        op.user_id AS userId,
        op.company_name AS companyName,
        op.bio,
        op.phone,
        op.website,
        op.avatar,
        op.business_type AS businessType,
        op.location,
        op.social_links AS socialLinks,
        op.verification_status AS verificationStatus,
        op.created_at AS createdAt,
        op.updated_at AS updatedAt,
        u.username,
        u.email,
        u.role,
        COUNT(e.id) AS totalEvents
      FROM owner_profiles op
      JOIN users u ON op.user_id = u.id
      LEFT JOIN events e ON e.owner_id = u.id
      WHERE op.user_id = @userId
      GROUP BY op.id, op.user_id, op.company_name, op.bio, op.phone, op.website, 
               op.avatar, op.business_type, op.location, op.social_links, 
               op.verification_status, op.created_at, op.updated_at,
               u.username, u.email, u.role
    `;
    
    await dbConnection.connect();
    const request = dbConnection.getPool().request();
    request.input('userId', sql.Int, userId);
    
    const result = await request.query(query);
    if (result.recordset.length === 0) return null;
    
    const profile = result.recordset[0];
    return {
      ...profile,
      totalEvents: parseInt(profile.totalEvents) || 0,
      socialLinks: profile.socialLinks ? JSON.parse(profile.socialLinks) : {}
    };
  },

  // Update profile
  update: async (userId, updateData) => {
    const { companyName, bio, phone, website, avatar, businessType, location, socialLinks } = updateData;
    
    const fields = [];
    const params = {};

    if (companyName !== undefined) {
      fields.push('company_name = @companyName');
      params.companyName = { type: sql.NVarChar, value: companyName };
    }
    if (bio !== undefined) {
      fields.push('bio = @bio');
      params.bio = { type: sql.NVarChar, value: bio };
    }
    if (phone !== undefined) {
      fields.push('phone = @phone');
      params.phone = { type: sql.NVarChar, value: phone };
    }
    if (website !== undefined) {
      fields.push('website = @website');
      params.website = { type: sql.NVarChar, value: website };
    }
    if (avatar !== undefined) {
      fields.push('avatar = @avatar');
      params.avatar = { type: sql.NVarChar, value: avatar };
    }
    if (businessType !== undefined) {
      fields.push('business_type = @businessType');
      params.businessType = { type: sql.NVarChar, value: businessType };
    }
    if (location !== undefined) {
      fields.push('location = @location');
      params.location = { type: sql.NVarChar, value: location };
    }
    if (socialLinks !== undefined) {
      fields.push('social_links = @socialLinks');
      params.socialLinks = { type: sql.NVarChar, value: JSON.stringify(socialLinks) };
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');

    const query = `
      UPDATE owner_profiles 
      SET ${fields.join(', ')} 
      OUTPUT 
        INSERTED.id,
        INSERTED.user_id AS userId,
        INSERTED.company_name AS companyName,
        INSERTED.bio,
        INSERTED.phone,
        INSERTED.website,
        INSERTED.avatar,
        INSERTED.business_type AS businessType,
        INSERTED.location,
        INSERTED.social_links AS socialLinks,
        INSERTED.verification_status AS verificationStatus,
        INSERTED.updated_at AS updatedAt
      WHERE user_id = @userId
    `;

    await dbConnection.connect();
    const request = dbConnection.getPool().request();
    request.input('userId', sql.Int, userId);
    
    Object.keys(params).forEach(key => {
      request.input(key, params[key].type, params[key].value);
    });

    const result = await request.query(query);
    const profile = result.recordset[0];
    
    return {
      ...profile,
      socialLinks: profile.socialLinks ? JSON.parse(profile.socialLinks) : {}
    };
  },

  // Update total events count
  updateEventCount: async (userId) => {
    const query = `
      UPDATE owner_profiles 
      SET total_events = (
        SELECT COUNT(*) FROM events WHERE owner_id = @userId
      )
      OUTPUT INSERTED.total_events AS totalEvents
      WHERE user_id = @userId
    `;
    
    await dbConnection.connect();
    const request = dbConnection.getPool().request();
    request.input('userId', sql.Int, userId);
    
    const result = await request.query(query);
    return result.recordset[0];
  },

  // Delete profile
  delete: async (userId) => {
    const query = `
      DELETE FROM owner_profiles 
      OUTPUT DELETED.id
      WHERE user_id = @userId
    `;
    
    await dbConnection.connect();
    const request = dbConnection.getPool().request();
    request.input('userId', sql.Int, userId);
    
    const result = await request.query(query);
    return result.recordset[0];
  }
};

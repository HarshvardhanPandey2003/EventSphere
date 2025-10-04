// backend/src/controllers/profile.controller.js
import { UserProfile, OwnerProfile } from '../models/Profile.model.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// USER PROFILE CONTROLLERS

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let profile = await UserProfile.findByUserId(userId);
    
    // Create profile if doesn't exist
    if (!profile) {
      profile = await UserProfile.create(userId, {});
    }
    
    res.json(profile);
  } catch (err) {
    console.error('Get user profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = { ...req.body };
    
    // Handle avatar upload
    if (req.file) {
      // Delete old avatar if exists
      const existingProfile = await UserProfile.findByUserId(userId);
      if (existingProfile?.avatar) {
        const oldAvatarPath = path.join(__dirname, '../../', existingProfile.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }
      updateData.avatar = `/uploads/avatars/${req.file.filename}`;
    }
    
    // Parse JSON fields
    if (updateData.interests && typeof updateData.interests === 'string') {
      updateData.interests = JSON.parse(updateData.interests);
    }
    if (updateData.socialLinks && typeof updateData.socialLinks === 'string') {
      updateData.socialLinks = JSON.parse(updateData.socialLinks);
    }
    
    // Check if profile exists
    const existingProfile = await UserProfile.findByUserId(userId);
    
    let profile;
    if (existingProfile) {
      profile = await UserProfile.update(userId, updateData);
    } else {
      profile = await UserProfile.create(userId, updateData);
    }
    
    // Fetch complete profile with user data
    const completeProfile = await UserProfile.findByUserId(userId);
    
    res.json(completeProfile);
  } catch (err) {
    console.error('Update user profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// OWNER PROFILE CONTROLLERS

// Get owner profile
export const getOwnerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let profile = await OwnerProfile.findByUserId(userId);
    
    // Create profile if doesn't exist
    if (!profile) {
      profile = await OwnerProfile.create(userId, {});
      // Fetch again to get the complete data with event count
      profile = await OwnerProfile.findByUserId(userId);
    }
    
    res.json(profile);
  } catch (err) {
    console.error('Get owner profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// Update owner profile
export const updateOwnerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = { ...req.body };
    
    // Handle avatar upload
    if (req.file) {
      // Delete old avatar if exists
      const existingProfile = await OwnerProfile.findByUserId(userId);
      if (existingProfile?.avatar) {
        const oldAvatarPath = path.join(__dirname, '../../', existingProfile.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }
      updateData.avatar = `/uploads/avatars/${req.file.filename}`;
    }
    
    // Parse JSON fields
    if (updateData.socialLinks && typeof updateData.socialLinks === 'string') {
      updateData.socialLinks = JSON.parse(updateData.socialLinks);
    }
    
    // Check if profile exists
    const existingProfile = await OwnerProfile.findByUserId(userId);
    
    let profile;
    if (existingProfile) {
      profile = await OwnerProfile.update(userId, updateData);
    } else {
      profile = await OwnerProfile.create(userId, updateData);
    }
    
    // Update event count
    await OwnerProfile.updateEventCount(userId);
    
    // Fetch complete profile with user data and event count
    const completeProfile = await OwnerProfile.findByUserId(userId);
    
    res.json(completeProfile);
  } catch (err) {
    console.error('Update owner profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Delete profile (soft delete - just removes extra data, keeps user account)
export const deleteUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const profile = await UserProfile.findByUserId(userId);
    
    // Delete avatar file if exists
    if (profile?.avatar) {
      const avatarPath = path.join(__dirname, '../../', profile.avatar);
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }
    
    await UserProfile.delete(userId);
    
    res.json({ message: 'Profile deleted successfully' });
  } catch (err) {
    console.error('Delete user profile error:', err);
    res.status(500).json({ error: 'Failed to delete profile' });
  }
};

export const deleteOwnerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const profile = await OwnerProfile.findByUserId(userId);
    
    // Delete avatar file if exists
    if (profile?.avatar) {
      const avatarPath = path.join(__dirname, '../../', profile.avatar);
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }
    
    await OwnerProfile.delete(userId);
    
    res.json({ message: 'Profile deleted successfully' });
  } catch (err) {
    console.error('Delete owner profile error:', err);
    res.status(500).json({ error: 'Failed to delete profile' });
  }
};

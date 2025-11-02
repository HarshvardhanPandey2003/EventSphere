// backend/src/controllers/profile.controller.js
import { UserProfile, OwnerProfile } from '../models/Profile.model.js';
import { replaceImage, deleteBlob } from '../utils/blobStorage.util.js';

// USER PROFILE CONTROLLERS

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let profile = await UserProfile.findByUserId(userId);
    
    if (!profile) {
      profile = await UserProfile.create(userId, {});
    }
    
    res.json(profile);
  } catch (err) {
    console.error('Get user profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = { ...req.body };
    
    // ✅ Handle avatar replacement (delete old + upload new)
    if (req.file) {
      const existingProfile = await UserProfile.findByUserId(userId);
      const newAvatarUrl = await replaceImage(
        req.file, 
        existingProfile?.avatar, 
        'avatar'
      );
      updateData.avatar = newAvatarUrl;
    }
    
    // Parse JSON fields
    if (updateData.interests && typeof updateData.interests === 'string') {
      updateData.interests = JSON.parse(updateData.interests);
    }
    if (updateData.socialLinks && typeof updateData.socialLinks === 'string') {
      updateData.socialLinks = JSON.parse(updateData.socialLinks);
    }
    
    const existingProfile = await UserProfile.findByUserId(userId);
    
    let profile;
    if (existingProfile) {
      profile = await UserProfile.update(userId, updateData);
    } else {
      profile = await UserProfile.create(userId, updateData);
    }
    
    const completeProfile = await UserProfile.findByUserId(userId);
    
    res.json(completeProfile);
  } catch (err) {
    console.error('Update user profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// OWNER PROFILE CONTROLLERS

export const getOwnerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let profile = await OwnerProfile.findByUserId(userId);
    
    if (!profile) {
      profile = await OwnerProfile.create(userId, {});
      profile = await OwnerProfile.findByUserId(userId);
    }
    
    res.json(profile);
  } catch (err) {
    console.error('Get owner profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateOwnerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = { ...req.body };
    
    // ✅ Handle avatar replacement
    if (req.file) {
      const existingProfile = await OwnerProfile.findByUserId(userId);
      const newAvatarUrl = await replaceImage(
        req.file,
        existingProfile?.avatar,
        'avatar'
      );
      updateData.avatar = newAvatarUrl;
    }
    
    if (updateData.socialLinks && typeof updateData.socialLinks === 'string') {
      updateData.socialLinks = JSON.parse(updateData.socialLinks);
    }
    
    const existingProfile = await OwnerProfile.findByUserId(userId);
    
    let profile;
    if (existingProfile) {
      profile = await OwnerProfile.update(userId, updateData);
    } else {
      profile = await OwnerProfile.create(userId, updateData);
    }
    
    await OwnerProfile.updateEventCount(userId);
    const completeProfile = await OwnerProfile.findByUserId(userId);
    
    res.json(completeProfile);
  } catch (err) {
    console.error('Update owner profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const deleteUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const profile = await UserProfile.findByUserId(userId);
    
    if (profile?.avatar) {
      await deleteBlob(profile.avatar);
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
    
    if (profile?.avatar) {
      await deleteBlob(profile.avatar);
    }
    
    await OwnerProfile.delete(userId);
    
    res.json({ message: 'Profile deleted successfully' });
  } catch (err) {
    console.error('Delete owner profile error:', err);
    res.status(500).json({ error: 'Failed to delete profile' });
  }
};

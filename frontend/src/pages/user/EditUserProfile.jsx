// src/pages/user/EditUserProfile.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Navbar } from '../../components/Navbar';

export const EditUserProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    bio: '',
    phone: '',
    dateOfBirth: '',
    location: '',
    interests: '',
    avatar: null,
    twitter: '',
    linkedin: '',
    github: '',
    instagram: ''
  });
  const [currentAvatar, setCurrentAvatar] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/api/profile/user');
      
      // Format date for input
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().split('T')[0];
      };

      setFormData({
        bio: data.bio || '',
        phone: data.phone || '',
        dateOfBirth: formatDateForInput(data.dateOfBirth),
        location: data.location || '',
        interests: data.interests ? data.interests.join(', ') : '',
        avatar: null,
        twitter: data.socialLinks?.twitter || '',
        linkedin: data.socialLinks?.linkedin || '',
        github: data.socialLinks?.github || '',
        instagram: data.socialLinks?.instagram || ''
      });
      
      setCurrentAvatar(data.avatar);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'avatar' && files && files[0]) {
      setFormData(prev => ({ ...prev, avatar: files[0] }));
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const submitData = new FormData();
      
      if (formData.bio) submitData.append('bio', formData.bio);
      if (formData.phone) submitData.append('phone', formData.phone);
      if (formData.dateOfBirth) submitData.append('dateOfBirth', formData.dateOfBirth);
      if (formData.location) submitData.append('location', formData.location);
      
      if (formData.interests) {
        const interestsArray = formData.interests.split(',').map(i => i.trim()).filter(i => i);
        submitData.append('interests', JSON.stringify(interestsArray));
      } // Here we ensure interests is an array  
          
      const socialLinks = {};
      if (formData.twitter) socialLinks.twitter = formData.twitter;
      if (formData.linkedin) socialLinks.linkedin = formData.linkedin;
      if (formData.github) socialLinks.github = formData.github;
      if (formData.instagram) socialLinks.instagram = formData.instagram;
      
      if (Object.keys(socialLinks).length > 0) {
        submitData.append('socialLinks', JSON.stringify(socialLinks));
      }
      
      if (formData.avatar) {
        submitData.append('avatar', formData.avatar);
      }

      await api.put('/api/profile/user', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      navigate('/profile');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-slate-700 border-t-cyan-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <Navbar />
      
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        <button
          onClick={() => navigate('/profile')}
          className="mb-6 flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Profile</span>
        </button>

        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
              <p className="text-slate-400 text-sm">Update your personal information</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <span className="text-red-400">{error}</span>
          </div>
        )}

        {/* Use the same form as CreateUserProfile but with pre-filled data */}
        <form onSubmit={handleSubmit} className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 space-y-6">
          
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">Profile Picture</label>
            
            {(imagePreview || currentAvatar) && (
              <div className="mb-4 flex justify-center">
                <img
                  src={imagePreview || currentAvatar}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full object-cover border-4 border-cyan-500/30"
                />
              </div>
            )}

            <input
              type="file"
              name="avatar"
              accept="image/*"
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-cyan-500 file:to-emerald-500 file:text-white file:font-semibold hover:file:from-cyan-600 hover:file:to-emerald-600 file:cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            />
            <p className="text-slate-400 text-xs mt-2">Upload a new image to replace current avatar</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                placeholder="+91-9876543210"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              placeholder="Mumbai, India"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Interests</label>
            <input
              type="text"
              name="interests"
              value={formData.interests}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              placeholder="Technology, Music, Sports (comma separated)"
            />
          </div>

          <div className="border-t border-slate-700 pt-6">
            <h3 className="text-lg font-bold text-white mb-4">Social Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Twitter</label>
                <input
                  type="url"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">LinkedIn</label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">GitHub</label>
                <input
                  type="url"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Instagram</label>
                <input
                  type="url"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 pt-6">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-cyan-500/25 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Update Profile</span>
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-white font-semibold rounded-lg transition-all border border-slate-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

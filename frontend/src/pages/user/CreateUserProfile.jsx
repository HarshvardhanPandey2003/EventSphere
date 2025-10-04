// src/pages/user/CreateUserProfile.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Navbar } from '../../components/Navbar';

export const CreateUserProfile = () => {
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
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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
      
      // Add basic fields
      if (formData.bio) submitData.append('bio', formData.bio);
      if (formData.phone) submitData.append('phone', formData.phone);
      if (formData.dateOfBirth) submitData.append('dateOfBirth', formData.dateOfBirth);
      if (formData.location) submitData.append('location', formData.location);
      
      // Add interests as array
      if (formData.interests) {
        const interestsArray = formData.interests.split(',').map(i => i.trim()).filter(i => i);
        submitData.append('interests', JSON.stringify(interestsArray));
      }
      
      // Add social links as JSON
      const socialLinks = {};
      if (formData.twitter) socialLinks.twitter = formData.twitter;
      if (formData.linkedin) socialLinks.linkedin = formData.linkedin;
      if (formData.github) socialLinks.github = formData.github;
      if (formData.instagram) socialLinks.instagram = formData.instagram;
      
      if (Object.keys(socialLinks).length > 0) {
        submitData.append('socialLinks', JSON.stringify(socialLinks));
      }
      
      // Add avatar
      if (formData.avatar) {
        submitData.append('avatar', formData.avatar);
      }

      await api.put('/api/profile/user', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      navigate('/profile');
    } catch (err) {
      console.error('Error creating profile:', err);
      setError(err.response?.data?.error || 'Failed to create profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <Navbar />
      
      {/* Background effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/profile')}
          className="mb-6 flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Profile</span>
        </button>

        {/* Header */}
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Create Your Profile</h1>
              <p className="text-slate-400 text-sm">Tell us more about yourself</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start space-x-3">
            <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-red-400">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 space-y-6">
          
          {/* Avatar Upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">Profile Picture</label>
            
            {imagePreview && (
              <div className="mb-4 flex justify-center">
                <img
                  src={imagePreview}
                  alt="Avatar preview"
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
          </div>

          {/* Bio */}
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

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phone */}
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

            {/* Date of Birth */}
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

          {/* Location */}
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

          {/* Interests */}
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
            <p className="text-slate-400 text-xs mt-2">Separate multiple interests with commas</p>
          </div>

          {/* Social Links Section */}
          <div className="border-t border-slate-700 pt-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span>Social Links</span>
              <span className="text-slate-500 text-sm font-normal">(Optional)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Twitter */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Twitter</label>
                <input
                  type="url"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                  placeholder="https://twitter.com/username"
                />
              </div>

              {/* LinkedIn */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">LinkedIn</label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              {/* GitHub */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">GitHub</label>
                <input
                  type="url"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                  placeholder="https://github.com/username"
                />
              </div>

              {/* Instagram */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Instagram</label>
                <input
                  type="url"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                  placeholder="https://instagram.com/username"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4 pt-6">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-cyan-500/25 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Create Profile</span>
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

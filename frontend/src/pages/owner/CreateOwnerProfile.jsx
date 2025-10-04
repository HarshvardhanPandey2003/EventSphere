// src/pages/owner/CreateOwnerProfile.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Navbar } from '../../components/Navbar';

export const CreateOwnerProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    bio: '',
    phone: '',
    website: '',
    businessType: '',
    location: '',
    avatar: null,
    twitter: '',
    linkedin: '',
    facebook: '',
    instagram: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const businessTypes = [
    'Corporate',
    'Individual',
    'Non-profit',
    'Educational',
    'Government',
    'Entertainment',
    'Sports',
    'Other'
  ];

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
      if (formData.companyName) submitData.append('companyName', formData.companyName);
      if (formData.bio) submitData.append('bio', formData.bio);
      if (formData.phone) submitData.append('phone', formData.phone);
      if (formData.website) submitData.append('website', formData.website);
      if (formData.businessType) submitData.append('businessType', formData.businessType);
      if (formData.location) submitData.append('location', formData.location);
      
      // Add social links as JSON
      const socialLinks = {};
      if (formData.twitter) socialLinks.twitter = formData.twitter;
      if (formData.linkedin) socialLinks.linkedin = formData.linkedin;
      if (formData.facebook) socialLinks.facebook = formData.facebook;
      if (formData.instagram) socialLinks.instagram = formData.instagram;
      
      if (Object.keys(socialLinks).length > 0) {
        submitData.append('socialLinks', JSON.stringify(socialLinks));
      }
      
      // Add avatar
      if (formData.avatar) {
        submitData.append('avatar', formData.avatar);
      }

      await api.put('/api/profile/owner', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      navigate('/owner/profile');
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
          onClick={() => navigate('/owner/profile')}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Create Business Profile</h1>
              <p className="text-slate-400 text-sm">Set up your organization details</p>
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
          
          {/* Logo/Avatar Upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">Company Logo / Avatar</label>
            
            {imagePreview && (
              <div className="mb-4 flex justify-center">
                <img
                  src={imagePreview}
                  alt="Logo preview"
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

          {/* Company Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Company / Organization Name</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              placeholder="Enter your company name"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">About Your Business</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all resize-none"
              placeholder="Tell us about your organization..."
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

            {/* Website */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Website</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                placeholder="https://yourcompany.com"
              />
            </div>
          </div>

          {/* Business Type and Location Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Business Type</label>
              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              >
                <option value="">Select business type</option>
                {businessTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
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
          </div>

          {/* Social Links Section */}
          <div className="border-t border-slate-700 pt-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span>Social Media Links</span>
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
                  placeholder="https://twitter.com/company"
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
                  placeholder="https://linkedin.com/company/name"
                />
              </div>

              {/* Facebook */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Facebook</label>
                <input
                  type="url"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                  placeholder="https://facebook.com/company"
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
                  placeholder="https://instagram.com/company"
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
              onClick={() => navigate('/owner/profile')}
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

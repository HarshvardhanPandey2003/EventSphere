// src/pages/owner/EditEvent.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { Navbar } from '../../components/Navbar';

export const EditEvent = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',  // NEW FIELD
    location: '',
    capacity: '',
    image: null
  });
  const [currentImage, setCurrentImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/events/${id}`);
      
      // Verify ownership
      if (data.ownerId !== user.id) {
        setError('You do not have permission to edit this event');
        setTimeout(() => navigate('/owner/dashboard'), 2000);
        return;
      }
      
      // Format dates for input fields
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
      };

      setFormData({
        title: data.title || '',
        description: data.description || '',
        startDate: formatDateForInput(data.startDate),
        endDate: formatDateForInput(data.endDate),
        registrationDeadline: formatDateForInput(data.registrationDeadline),
        location: data.location || '',
        capacity: data.capacity || '',
        image: null
      });
      
      setCurrentImage(data.image);
    } catch (err) {
      console.error('Error fetching event:', err);
      setError(err.response?.data?.error || 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'image' && files && files[0]) {
      setFormData(prev => ({ ...prev, image: files[0] }));
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
      // Validation
      if (!formData.title || !formData.description || !formData.startDate || 
          !formData.endDate || !formData.location || !formData.capacity) {
        setError('Please fill in all required fields');
        setSubmitting(false);
        return;
      }

      // Validate dates
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const regDeadline = formData.registrationDeadline ? new Date(formData.registrationDeadline) : null;
      
      if (end <= start) {
        setError('End date must be after start date');
        setSubmitting(false);
        return;
      }

      if (regDeadline && regDeadline > start) {
        setError('Registration deadline must be before event start date');
        setSubmitting(false);
        return;
      }

      // Prepare form data for multipart upload
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('startDate', formData.startDate);
      submitData.append('endDate', formData.endDate);
      if (formData.registrationDeadline) {
        submitData.append('registrationDeadline', formData.registrationDeadline);
      }
      submitData.append('location', formData.location);
      submitData.append('capacity', formData.capacity);
      
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      await api.put(`/api/events/${id}`, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess(true);
      setTimeout(() => {
        navigate(`/owner/event/${id}`);
      }, 2000);
    } catch (err) {
      console.error('Error updating event:', err);
      setError(err.response?.data?.error || 'Failed to update event');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-cyan-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-400 mt-4">Loading event...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <Navbar />
      
      {/* Background effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(`/owner/event/${id}`)}
          className="mb-6 flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Event Details</span>
        </button>

        {/* Header */}
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Edit Event</h1>
              <p className="text-slate-400 text-sm">Update your event information</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-start space-x-3">
            <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-emerald-400 font-medium">Event updated successfully!</p>
              <p className="text-emerald-300 text-sm">Redirecting...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
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
          
          {/* Event Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Event Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              placeholder="Enter event title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none"
              placeholder="Describe your event in detail"
              required
            />
          </div>

          {/* Date Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Start Date & Time <span className="text-red-400">*</span>
              </label>
              <input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                End Date & Time <span className="text-red-400">*</span>
              </label>
              <input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {/* Registration Deadline (NEW) */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Registration Deadline <span className="text-slate-500">(Optional)</span>
            </label>
            <input
              type="datetime-local"
              name="registrationDeadline"
              value={formData.registrationDeadline}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            />
            <p className="text-slate-400 text-xs mt-2">
              Set a deadline for event registration. If not set, registration remains open until the event starts.
            </p>
          </div>

          {/* Location and Capacity Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Location <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="Event venue or address"
                required
              />
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Capacity <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="Maximum attendees"
                required
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Event Image
            </label>
            
            {/* Current Image Preview */}
            {(currentImage || imagePreview) && (
              <div className="mb-4">
                <p className="text-slate-400 text-sm mb-2">
                  {imagePreview ? 'New Image Preview:' : 'Current Image:'}
                </p>
                <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-slate-600">
                  <img
                    src={imagePreview || currentImage}
                    alt="Event preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-cyan-500 file:to-emerald-500 file:text-white file:font-semibold hover:file:from-cyan-600 hover:file:to-emerald-600 file:cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            />
            <p className="text-slate-400 text-xs mt-2">
              Upload a new image to replace the current one. Leave blank to keep existing image.
            </p>
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
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Update Event</span>
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => navigate(`/owner/event/${id}`)}
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

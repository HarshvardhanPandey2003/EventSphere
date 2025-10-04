// src/pages/user/UserEventDetails.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { Navbar } from '../../components/Navbar';

export const UserEventDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/events/${id}`);
      setEvent(data);
      
      // Check if user is already registered
      const userRegistered = data.attendees?.some(a => a.userId === user.id);
      setIsRegistered(userRegistered);
    } catch (err) {
      console.error('Error fetching event:', err);
      setError(err.response?.data?.error || 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setRegistering(true);
      setError('');
      
      await api.post(`/api/events/${id}/register`);
      setIsRegistered(true);
      
      // Refresh event data
      fetchEventDetails();
    } catch (err) {
      console.error('Error registering:', err);
      setError(err.response?.data?.error || 'Failed to register for event');
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    try {
      setRegistering(true);
      setError('');
      
      await api.delete(`/api/events/${id}/unregister`);
      setIsRegistered(false);
      
      // Refresh event data
      fetchEventDetails();
    } catch (err) {
      console.error('Error unregistering:', err);
      setError(err.response?.data?.error || 'Failed to unregister from event');
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBA';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getEventStatus = () => {
    if (!event) return 'Unknown';
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    
    if (endDate < now) return 'Completed';
    if (startDate > now) return 'Upcoming';
    if (startDate <= now && endDate >= now) return 'Ongoing';
    return 'Active';
  };

  const isRegistrationOpen = () => {
    if (!event) return false;
    const now = new Date();
    const startDate = new Date(event.startDate);
    const regDeadline = event.registrationDeadline ? new Date(event.registrationDeadline) : startDate;
    
    // Check if event has started
    if (now >= startDate) return false;
    
    // Check if registration deadline has passed
    if (now >= regDeadline) return false;
    
    // Check if event is full
    if (event.attendees.length >= event.capacity) return false;
    
    return true;
  };

  const getSpotsRemaining = () => {
    if (!event) return 0;
    return event.capacity - event.attendees.length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-cyan-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-400 mt-4">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start space-x-3">
            <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-red-400 font-medium">{error}</p>
              <button 
                onClick={() => navigate('/dashboard')}
                className="text-red-300 text-sm underline mt-1"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Dashboard</span>
        </button>

        {/* Event Hero Section */}
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden mb-6">
          {/* Hero Image */}
          {event.image && (
            <div className="h-64 lg:h-96 relative overflow-hidden">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
              
              {/* Registration Status Badge */}
              <div className="absolute top-6 right-6">
                {isRegistered ? (
                  <span className="px-4 py-2 bg-emerald-500/90 text-white text-sm font-semibold rounded-full border border-emerald-400 flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Registered</span>
                  </span>
                ) : getSpotsRemaining() === 0 ? (
                  <span className="px-4 py-2 bg-red-500/90 text-white text-sm font-semibold rounded-full border border-red-400">
                    Sold Out
                  </span>
                ) : isRegistrationOpen() ? (
                  <span className="px-4 py-2 bg-cyan-500/90 text-white text-sm font-semibold rounded-full border border-cyan-400">
                    Open for Registration
                  </span>
                ) : (
                  <span className="px-4 py-2 bg-slate-500/90 text-white text-sm font-semibold rounded-full border border-slate-400">
                    Registration Closed
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Event Info */}
          <div className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                  {event.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-slate-400 mb-6">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">{formatDate(event.startDate)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm">{event.location}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-sm">{event.attendees.length} / {event.capacity} attending</span>
                  </div>
                </div>

                {/* Registration Deadline (if exists) */}
                {event.registrationDeadline && (
                  <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-start space-x-3">
                    <svg className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-orange-400 font-medium">Registration Deadline</p>
                      <p className="text-orange-300 text-sm">{formatDate(event.registrationDeadline)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="flex-shrink-0">
                {isRegistered ? (
                  <button
                    onClick={handleUnregister}
                    disabled={registering}
                    className="px-8 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold rounded-lg transition-all border border-red-500/30 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {registering ? (
                      <>
                        <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>Unregister</span>
                      </>
                    )}
                  </button>
                ) : isRegistrationOpen() ? (
                  <button
                    onClick={handleRegister}
                    disabled={registering}
                    className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-cyan-500/25 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {registering ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Register Now</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    disabled
                    className="px-8 py-4 bg-slate-700/50 text-slate-400 font-semibold rounded-lg border border-slate-600 cursor-not-allowed flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Registration Closed</span>
                  </button>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start space-x-3">
                <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-red-400">{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Event Details Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Event Status */}
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-slate-400 mb-3">Event Status</h3>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center border border-cyan-500/20">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{getEventStatus()}</div>
                <div className="text-slate-400 text-xs">Current Status</div>
              </div>
            </div>
          </div>

          {/* Spots Remaining */}
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-slate-400 mb-3">Spots Remaining</h3>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{getSpotsRemaining()}</div>
                <div className="text-slate-400 text-xs">of {event.capacity} total</div>
              </div>
            </div>
          </div>

          {/* Time Until Event */}
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-slate-400 mb-3">Time Until Event</h3>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center border border-purple-500/20">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                {getEventStatus() === 'Upcoming' ? (
                  <>
                    <div className="text-2xl font-bold text-white">
                      {Math.ceil((new Date(event.startDate) - new Date()) / (1000 * 60 * 60 * 24))} days
                    </div>
                    <div className="text-slate-400 text-xs">Until start</div>
                  </>
                ) : getEventStatus() === 'Ongoing' ? (
                  <>
                    <div className="text-2xl font-bold text-emerald-400">Live Now</div>
                    <div className="text-slate-400 text-xs">Event ongoing</div>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-slate-400">Ended</div>
                    <div className="text-slate-400 text-xs">Event completed</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Event Description */}
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 lg:p-8 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">About This Event</h2>
          <p className="text-slate-300 leading-relaxed whitespace-pre-line">{event.description}</p>
        </div>

        {/* Event Details Grid */}
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 lg:p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Event Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-2">Start Date & Time</h3>
              <p className="text-white">{formatDate(event.startDate)}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-2">End Date & Time</h3>
              <p className="text-white">{formatDate(event.endDate)}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-2">Location</h3>
              <p className="text-white">{event.location}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-2">Capacity</h3>
              <p className="text-white">{event.capacity} attendees</p>
            </div>

            {event.registrationDeadline && (
              <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-2">Registration Deadline</h3>
                <p className="text-white">{formatDate(event.registrationDeadline)}</p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-2">Organized By</h3>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {event.ownerName?.charAt(0).toUpperCase() || 'O'}
                </div>
                <span className="text-white">{event.ownerName || 'Event Organizer'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

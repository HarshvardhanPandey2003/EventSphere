// src/pages/owner/OwnerEventDetails.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { Navbar } from '../../components/Navbar';

export const OwnerEventDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [timeUntilDeadline, setTimeUntilDeadline] = useState(null);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  // Countdown timer for deadline
  useEffect(() => {
    if (!event?.deadline) return;

    const updateCountdown = () => {
      const now = new Date();
      const deadlineDate = new Date(event.deadline);
      const timeLeft = deadlineDate.getTime() - now.getTime();

      if (timeLeft <= 0) {
        setTimeUntilDeadline({ expired: true });
        return;
      }

      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      setTimeUntilDeadline({ days, hours, minutes, seconds, expired: false });
    };

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);

    return () => clearInterval(intervalId);
  }, [event?.deadline]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/events/${id}`);
      
      if (data.ownerId !== user.id) {
        setError('You do not have permission to view this event');
        setTimeout(() => navigate('/dashboard'), 2000);
        return;
      }
      
      setEvent(data);
    } catch (err) {
      console.error('Error fetching event:', err);
      setError(err.response?.data?.error || 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    try {
      await api.delete(`/api/events/${id}`);
      navigate('/dashboard', { 
        state: { message: 'Event deleted successfully' } 
      });
    } catch (err) {
      console.error('Error deleting event:', err);
      setError(err.response?.data?.error || 'Failed to delete event');
    }
  };

  const handleEditEvent = () => {
    navigate(`/owner/edit-event/${id}`);
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

  const formatShortDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getDeadlineStatus = () => {
    if (!event?.deadline) return 'no-deadline';
    const now = new Date();
    const deadlineDate = new Date(event.deadline);
    const hoursUntilDeadline = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilDeadline <= 0) return 'expired';
    if (hoursUntilDeadline <= 24) return 'urgent';
    if (hoursUntilDeadline <= 72) return 'soon';
    return 'active';
  };

  const getDeadlineStatusColor = (status) => {
    switch (status) {
      case 'expired':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'urgent':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'soon':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'active':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const getDeadlineStatusText = (status) => {
    switch (status) {
      case 'expired':
        return 'Registration Closed';
      case 'urgent':
        return 'Closing Soon!';
      case 'soon':
        return 'Deadline Approaching';
      case 'active':
        return 'Registration Open';
      default:
        return 'No Deadline Set';
    }
  };

  const getEventStatus = () => {
    if (!event) return 'Unknown';
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    
    if (endDate < now) return 'Completed';
    if (startDate > now) return 'Upcoming';
    if (startDate <= now && endDate >= now) return 'Ongoing';
    return event.status || 'Active';
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'upcoming':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'ongoing':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'completed':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
      case 'cancelled':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      default:
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    }
  };

  const getAttendanceRate = () => {
    if (!event || !event.capacity) return 0;
    return Math.round((event.attendees.length / event.capacity) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-cyan-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-emerald-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
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

        {/* Event Header with Image */}
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden mb-6">
          {/* Hero Image */}
          {event.image && (
            <div className="h-64 lg:h-80 relative overflow-hidden">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
              
              {/* Status Badges */}
              <div className="absolute top-6 right-6 flex flex-col space-y-2">
                <span className={`px-4 py-2 text-sm font-semibold rounded-full border ${getStatusColor(getEventStatus())}`}>
                  {getEventStatus()}
                </span>
                <span className={`px-4 py-2 text-sm font-semibold rounded-full border ${getDeadlineStatusColor(getDeadlineStatus())}`}>
                  {getDeadlineStatusText(getDeadlineStatus())}
                </span>
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
                </div>

                {/* Deadline Alert Banner */}
                {event.deadline && getDeadlineStatus() !== 'expired' && (
                  <div className={`p-4 rounded-lg border mb-4 ${
                    getDeadlineStatus() === 'urgent' 
                      ? 'bg-orange-500/10 border-orange-500/30' 
                      : getDeadlineStatus() === 'soon'
                      ? 'bg-yellow-500/10 border-yellow-500/30'
                      : 'bg-emerald-500/10 border-emerald-500/30'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className={`w-5 h-5 ${
                        getDeadlineStatus() === 'urgent' ? 'text-orange-400' : 
                        getDeadlineStatus() === 'soon' ? 'text-yellow-400' : 
                        'text-emerald-400'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className={`font-semibold ${
                        getDeadlineStatus() === 'urgent' ? 'text-orange-400' : 
                        getDeadlineStatus() === 'soon' ? 'text-yellow-400' : 
                        'text-emerald-400'
                      }`}>
                        Registration Deadline: {formatShortDate(event.deadline)}
                      </span>
                    </div>
                    {timeUntilDeadline && !timeUntilDeadline.expired && (
                      <div className="flex items-center space-x-4 text-sm">
                        <span className={`${
                          getDeadlineStatus() === 'urgent' ? 'text-orange-300' : 
                          getDeadlineStatus() === 'soon' ? 'text-yellow-300' : 
                          'text-emerald-300'
                        }`}>
                          Time Remaining:
                        </span>
                        <div className="flex items-center space-x-3 font-mono font-bold">
                          <span className={`${
                            getDeadlineStatus() === 'urgent' ? 'text-orange-400' : 
                            getDeadlineStatus() === 'soon' ? 'text-yellow-400' : 
                            'text-emerald-400'
                          }`}>
                            {timeUntilDeadline.days}d {timeUntilDeadline.hours}h {timeUntilDeadline.minutes}m {timeUntilDeadline.seconds}s
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {event.deadline && getDeadlineStatus() === 'expired' && (
                  <div className="p-4 rounded-lg border bg-red-500/10 border-red-500/30 mb-4">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold text-red-400">
                        Registration Closed - Deadline passed on {formatShortDate(event.deadline)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleEditEvent}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-cyan-500/25 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit Event</span>
                </button>
                
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold rounded-lg transition-all border border-red-500/30 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center border border-cyan-500/20">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{event.attendees.length}</div>
            <div className="text-slate-400 text-sm">Total Attendees</div>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{event.capacity}</div>
            <div className="text-slate-400 text-sm">Total Capacity</div>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center border border-purple-500/20">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{getAttendanceRate()}%</div>
            <div className="text-slate-400 text-sm">Attendance Rate</div>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center border border-orange-500/20">
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {event.capacity - event.attendees.length}
            </div>
            <div className="text-slate-400 text-sm">Spots Remaining</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-2 mb-6 inline-flex space-x-2">
          {[
            { value: 'details', label: 'Event Details', icon: '📋' },
            { value: 'attendees', label: 'Attendees', icon: '👥', count: event.attendees.length },
            { value: 'analytics', label: 'Analytics', icon: '📊' }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                activeTab === tab.value
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.value 
                    ? 'bg-white/20' 
                    : 'bg-slate-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 lg:p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Event Details</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-2">Description</h3>
                <p className="text-slate-300 leading-relaxed">{event.description}</p>
              </div>

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
                  <h3 className="text-sm font-semibold text-slate-400 mb-2">Registration Deadline</h3>
                  <div className="flex items-center space-x-2">
                    <p className="text-white">{formatDate(event.deadline)}</p>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getDeadlineStatusColor(getDeadlineStatus())}`}>
                      {getDeadlineStatusText(getDeadlineStatus())}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-2">Location</h3>
                  <p className="text-white">{event.location}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-2">Capacity</h3>
                  <p className="text-white">{event.capacity} attendees</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-2">Event Status</h3>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(getEventStatus())}`}>
                    {getEventStatus()}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-2">Created</h3>
                  <p className="text-white">{formatDate(event.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendees' && (
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Attendees List</h2>
              <button
                className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg transition-all border border-slate-600 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export CSV</span>
              </button>
            </div>

            {event.attendees.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-400 font-semibold text-sm">#</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-semibold text-sm">Name</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-semibold text-sm">Email</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-semibold text-sm">Registered At</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-semibold text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {event.attendees.map((attendee, index) => (
                      <tr key={attendee.userId} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                        <td className="py-4 px-4 text-slate-300">{index + 1}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {attendee.username?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <span className="text-white font-medium">{attendee.username || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-300">{attendee.email || 'N/A'}</td>
                        <td className="py-4 px-4 text-slate-300">
                          {new Date(attendee.registeredAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/30">
                            Confirmed
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Attendees Yet</h3>
                <p className="text-slate-400">Attendees will appear here once they register for your event.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 lg:p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Event Analytics</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Registration Progress */}
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Registration Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Capacity Filled</span>
                      <span className="text-white font-semibold">{getAttendanceRate()}%</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-3 rounded-full transition-all"
                        style={{ width: `${getAttendanceRate()}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-white mb-1">{event.attendees.length}</div>
                      <div className="text-slate-400 text-xs">Registered</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-white mb-1">{event.capacity - event.attendees.length}</div>
                      <div className="text-slate-400 text-xs">Available</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Registration Deadline Countdown */}
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Registration Deadline</h3>
                <div className="text-center py-4">
                  {getDeadlineStatus() === 'expired' ? (
                    <>
                      <div className="text-4xl font-bold text-red-400 mb-2">
                        Closed
                      </div>
                      <p className="text-slate-400">Registration period has ended</p>
                      <p className="text-sm text-slate-500 mt-2">
                        Closed on {formatShortDate(event.deadline)}
                      </p>
                    </>
                  ) : timeUntilDeadline && !timeUntilDeadline.expired ? (
                    <>
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <div className={`text-2xl font-bold ${
                            getDeadlineStatus() === 'urgent' ? 'text-orange-400' : 
                            getDeadlineStatus() === 'soon' ? 'text-yellow-400' : 
                            'text-emerald-400'
                          }`}>
                            {timeUntilDeadline.days}
                          </div>
                          <div className="text-slate-400 text-xs">Days</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <div className={`text-2xl font-bold ${
                            getDeadlineStatus() === 'urgent' ? 'text-orange-400' : 
                            getDeadlineStatus() === 'soon' ? 'text-yellow-400' : 
                            'text-emerald-400'
                          }`}>
                            {timeUntilDeadline.hours}
                          </div>
                          <div className="text-slate-400 text-xs">Hours</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <div className={`text-2xl font-bold ${
                            getDeadlineStatus() === 'urgent' ? 'text-orange-400' : 
                            getDeadlineStatus() === 'soon' ? 'text-yellow-400' : 
                            'text-emerald-400'
                          }`}>
                            {timeUntilDeadline.minutes}
                          </div>
                          <div className="text-slate-400 text-xs">Minutes</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <div className={`text-2xl font-bold ${
                            getDeadlineStatus() === 'urgent' ? 'text-orange-400' : 
                            getDeadlineStatus() === 'soon' ? 'text-yellow-400' : 
                            'text-emerald-400'
                          }`}>
                            {timeUntilDeadline.seconds}
                          </div>
                          <div className="text-slate-400 text-xs">Seconds</div>
                        </div>
                      </div>
                      <p className="text-slate-400">Until registration closes</p>
                      <p className="text-sm text-slate-500 mt-2">
                        Deadline: {formatShortDate(event.deadline)}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl font-bold text-slate-400 mb-2">
                        N/A
                      </div>
                      <p className="text-slate-400">Loading deadline information...</p>
                    </>
                  )}
                </div>
              </div>

              {/* Time Until Event */}
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Time Until Event</h3>
                <div className="text-center py-4">
                  {getEventStatus() === 'Upcoming' ? (
                    <>
                      <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 mb-2">
                        {Math.ceil((new Date(event.startDate) - new Date()) / (1000 * 60 * 60 * 24))} Days
                      </div>
                      <p className="text-slate-400">Until event starts</p>
                    </>
                  ) : getEventStatus() === 'Ongoing' ? (
                    <>
                      <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2">
                        Live Now
                      </div>
                      <p className="text-slate-400">Event is currently ongoing</p>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl font-bold text-slate-400 mb-2">
                        Completed
                      </div>
                      <p className="text-slate-400">Event has ended</p>
                    </>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl mb-2">📅</div>
                    <div className="text-2xl font-bold text-white mb-1">
                      {Math.ceil((new Date(event.endDate) - new Date(event.startDate)) / (1000 * 60 * 60))}h
                    </div>
                    <div className="text-slate-400 text-xs">Duration</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">👥</div>
                    <div className="text-2xl font-bold text-white mb-1">{event.attendees.length}</div>
                    <div className="text-slate-400 text-xs">Attendees</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">⏰</div>
                    <div className={`text-2xl font-bold mb-1 ${
                      getDeadlineStatus() === 'expired' ? 'text-red-400' : 
                      getDeadlineStatus() === 'urgent' ? 'text-orange-400' : 
                      getDeadlineStatus() === 'soon' ? 'text-yellow-400' : 
                      'text-emerald-400'
                    }`}>
                      {getDeadlineStatus() === 'expired' 
                        ? 'Closed' 
                        : timeUntilDeadline && !timeUntilDeadline.expired
                        ? `${timeUntilDeadline.days}d`
                        : 'N/A'
                      }
                    </div>
                    <div className="text-slate-400 text-xs">To Deadline</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">✨</div>
                    <div className="text-2xl font-bold text-white mb-1">{getEventStatus()}</div>
                    <div className="text-slate-400 text-xs">Status</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">Delete Event?</h3>
              </div>
              
              <p className="text-slate-400 mb-6">
                Are you sure you want to delete "{event.title}"? This action cannot be undone and all attendee registrations will be lost.
              </p>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteEvent}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all"
                >
                  Delete Event
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

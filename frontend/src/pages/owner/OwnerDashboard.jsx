// src/pages/owner/OwnerDashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { EventCard } from '../../components/EventCard';
import { api } from '../../services/api';
import { Navbar } from '../../components/Navbar';

export const OwnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalAttendees: 0,
    upcomingEvents: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, past, upcoming

  useEffect(() => {
    const fetchEventsAndStats = async () => {
      try {
        const { data } = await api.get('/api/events/owner');
        console.log("Fetched Events:", data);
        setEvents(data);
        
        // Calculate stats
        const now = new Date();
        const active = data.filter(e => new Date(e.endDate) > now && e.status === 'active').length;
        const upcoming = data.filter(e => new Date(e.startDate) > now).length;
        const totalAttendees = data.reduce((sum, e) => sum + (e.attendees?.length || 0), 0);
        
        setStats({
          totalEvents: data.length,
          activeEvents: active,
          totalAttendees,
          upcomingEvents: upcoming
        });
      } catch (err) {
        console.error("Error fetching events:", err);
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEventsAndStats();
  }, []);

  const filteredEvents = events.filter(event => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    
    if (filter === 'active') return endDate > now && event.status === 'active';
    if (filter === 'past') return endDate < now;
    if (filter === 'upcoming') return startDate > now;
    return true; // 'all'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <Navbar />
      
      {/* Background effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* Header Section */}
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
            <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                </div>
                <div>
                <h1 className="text-2xl font-bold text-white">
                    Welcome back, {user?.username}!
                </h1>
                <p className="text-slate-400 mt-0.5 text-sm">
                    Manage and monitor your events
                </p>
                </div>
            </div>
            </div>
            <button
            onClick={() => navigate('/owner/create-event')}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-semibold rounded-md transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-cyan-500/25 flex items-center space-x-2"
            >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm">Create New Event</span>
            </button>
        </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-lg p-4 hover:border-cyan-500/50 transition-all">
            <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center border border-cyan-500/20">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
            <span className="text-cyan-400 text-xs font-semibold">Total</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stats.totalEvents}</div>
            <div className="text-slate-400 text-xs">Total Events</div>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-lg p-4 hover:border-emerald-500/50 transition-all">
            <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <span className="text-emerald-400 text-xs font-semibold">Active</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stats.activeEvents}</div>
            <div className="text-slate-400 text-xs">Active Events</div>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-lg p-4 hover:border-purple-500/50 transition-all">
            <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center border border-purple-500/20">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            </div>
            <span className="text-purple-400 text-xs font-semibold">Attendees</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stats.totalAttendees}</div>
            <div className="text-slate-400 text-xs">Total Attendees</div>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-lg p-4 hover:border-orange-500/50 transition-all">
            <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center border border-orange-500/20">
                <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <span className="text-orange-400 text-xs font-semibold">Upcoming</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stats.upcomingEvents}</div>
            <div className="text-slate-400 text-xs">Upcoming Events</div>
        </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-2 mb-6 inline-flex space-x-2">
          {[
            { value: 'all', label: 'All Events', icon: '📋' },
            { value: 'active', label: 'Active', icon: '✅' },
            { value: 'upcoming', label: 'Upcoming', icon: '📅' },
            { value: 'past', label: 'Past', icon: '🕐' }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                filter === tab.value
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start space-x-3">
            <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-red-400">{error}</span>
          </div>
        )}

        {/* Events Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
              <span>Your Events</span>
              <span className="px-3 py-1 bg-slate-700/50 rounded-full text-sm text-slate-300">
                {filteredEvents.length}
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-700 border-t-cyan-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-emerald-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
              <p className="text-slate-400 mt-4">Loading your events...</p>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => navigate(`/owner/event/${event.id}`)}  // CHANGED from /event/ to /owner/event/
                  className="cursor-pointer transform transition-all hover:scale-[1.02]"
                >
                  <EventCard event={event} userRole="owner" />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-12 text-center">
              <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {filter === 'all' ? 'No events yet' : `No ${filter} events`}
              </h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                {filter === 'all' 
                  ? "Get started by creating your first event and reaching your audience!"
                  : `You don't have any ${filter} events at the moment.`}
              </p>
              <button
                onClick={() => navigate('/owner/create-event')}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-cyan-500/25"
              >
                Create Your First Event
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

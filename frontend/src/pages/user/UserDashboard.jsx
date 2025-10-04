// src/pages/user/UserDashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { EventCard } from '../../components/EventCard';
import { api } from '../../services/api';
import { Navbar } from '../../components/Navbar';

export const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Separate state for registered and all events
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [stats, setStats] = useState({
    registeredEvents: 0,
    upcomingEvents: 0,
    pastEvents: 0,
    attendedEvents: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // Changed default to 'all'

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        
        // Fetch registered events
        const registeredResponse = await api.get('/api/events/registered');
        console.log("Fetched Registered Events:", registeredResponse.data);
        setRegisteredEvents(registeredResponse.data);
        
        // Fetch all available events
        const allEventsResponse = await api.get('/api/events');
        console.log("Fetched All Events:", allEventsResponse.data);
        setAllEvents(allEventsResponse.data);
        
        // Calculate stats based on registered events only
        const now = new Date();
        const registered = registeredResponse.data;
        
        const upcoming = registered.filter(e => new Date(e.startDate) > now).length;
        const past = registered.filter(e => new Date(e.endDate) < now).length;
        const attended = registered.filter(e => {
          const hasEnded = new Date(e.endDate) < now;
          const isRegistered = e.attendees?.some(a => a.userId === user.id);
          return hasEnded && isRegistered;
        }).length;
        
        setStats({
          registeredEvents: registered.length,
          upcomingEvents: upcoming,
          pastEvents: past,
          attendedEvents: attended
        });
      } catch (err) {
        console.error("Error fetching events:", err);
        setError(err.response?.data?.error || 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchEvents();
    }
  }, [user?.id]);

  // Get filtered events based on selected filter
  const getFilteredEvents = () => {
    const now = new Date();
    
    // Determine which event list to use
    let eventsToFilter = filter === 'all' ? allEvents : registeredEvents;
    
    // Apply time-based filters
    if (filter === 'registered') {
      return eventsToFilter;
    }
    
    if (filter === 'all') {
      return eventsToFilter;
    }
    
    if (filter === 'upcoming') {
      return registeredEvents.filter(event => new Date(event.startDate) > now);
    }
    
    if (filter === 'past') {
      return registeredEvents.filter(event => new Date(event.endDate) < now);
    }
    
    if (filter === 'attended') {
      return registeredEvents.filter(event => {
        const hasEnded = new Date(event.endDate) < now;
        const isRegistered = event.attendees?.some(a => a.userId === user.id);
        return hasEnded && isRegistered;
      });
    }
    
    return eventsToFilter;
  };

  const filteredEvents = getFilteredEvents();

  // Reordered filter tabs - 'All Events' now comes first
  const filterTabs = [
    { value: 'all', label: 'All Events', icon: '📋' },
    { value: 'registered', label: 'Registered', icon: '✅' },
    { value: 'upcoming', label: 'Upcoming', icon: '📅' },
    { value: 'past', label: 'Past', icon: '🕐' },
    { value: 'attended', label: 'Attended', icon: '✔️' }
  ];

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
                    Explore and manage your event registrations
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/events')}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-semibold rounded-md transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-cyan-500/25 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm">Browse Events</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Registered</p>
                <p className="text-white text-2xl font-bold">{stats.registeredEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Upcoming</p>
                <p className="text-white text-2xl font-bold">{stats.upcomingEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🕐</span>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Past</p>
                <p className="text-white text-2xl font-bold">{stats.pastEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✔️</span>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Attended</p>
                <p className="text-white text-2xl font-bold">{stats.attendedEvents}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-2 mb-6 inline-flex space-x-2 overflow-x-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
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
            <div>
              <p className="text-red-400 font-medium">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="text-red-300 text-sm underline mt-1"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Events Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
              <span>
                {filter === 'all' ? 'All Available Events' : 
                 filter === 'registered' ? 'My Registered Events' :
                 filter === 'upcoming' ? 'Upcoming Events' :
                 filter === 'past' ? 'Past Events' :
                 'Attended Events'}
              </span>
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
                  onClick={() => navigate(`/event/${event.id}`)}
                  className="cursor-pointer transform transition-all hover:scale-[1.02]"
                >
                  <EventCard event={event} />
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
                {filter === 'all' ? 'No events available yet' :
                 filter === 'registered' ? 'No registered events yet' :
                 filter === 'upcoming' ? 'No upcoming events' :
                 filter === 'past' ? 'No past events' :
                 'No attended events'}
              </h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                {filter === 'all' 
                  ? "Check back later for new events!"
                  : filter === 'registered'
                  ? "Start exploring events and register for ones that interest you!"
                  : `You don't have any ${filter} events at the moment.`}
              </p>
              {(filter === 'registered' || filter === 'all') && (
                <button
                  onClick={() => filter === 'all' ? navigate('/events') : setFilter('all')}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-cyan-500/25"
                >
                  {filter === 'all' ? 'Browse Events Page' : 'View All Events'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

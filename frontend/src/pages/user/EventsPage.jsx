// src/pages/user/EventsPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { EventCard } from '../../components/EventCard';
import { api } from '../../services/api';
import { Navbar } from '../../components/Navbar';

export const EventsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allEvents, setAllEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, upcoming, ongoing, past
  const [sortBy, setSortBy] = useState('date'); // date, popularity, capacity

  useEffect(() => {
    fetchAllEvents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allEvents, searchQuery, statusFilter, sortBy]);

  const fetchAllEvents = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/events');
      console.log("Fetched all events:", data);
      setAllEvents(data);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.response?.data?.error || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allEvents];
    const now = new Date();

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => {
        const startDate = new Date(event.startDate);
        const endDate = new Date(event.endDate);
        
        if (statusFilter === 'upcoming') return startDate > now;
        if (statusFilter === 'ongoing') return startDate <= now && endDate >= now;
        if (statusFilter === 'past') return endDate < now;
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(a.startDate) - new Date(b.startDate);
      }
      if (sortBy === 'popularity') {
        return (b.attendees?.length || 0) - (a.attendees?.length || 0);
      }
      if (sortBy === 'capacity') {
        return b.capacity - a.capacity;
      }
      return 0;
    });

    setFilteredEvents(filtered);
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    
    if (endDate < now) return 'past';
    if (startDate > now) return 'upcoming';
    if (startDate <= now && endDate >= now) return 'ongoing';
    return 'upcoming';
  };

  const isRegistrationOpen = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const regDeadline = event.registrationDeadline 
      ? new Date(event.registrationDeadline) 
      : startDate;
    
    if (now >= startDate) return false;
    if (now >= regDeadline) return false;
    if (event.attendees?.length >= event.capacity) return false;
    
    return true;
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSortBy('date');
  };

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

        {/* Header */}
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Browse Events</h1>
                  <p className="text-slate-400 mt-0.5 text-sm">
                    Discover and register for upcoming events
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Search Bar */}
            <div className="lg:col-span-5">
              <label className="block text-sm font-semibold text-slate-300 mb-2">Search Events</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, description, or location..."
                  className="w-full px-4 py-3 pl-11 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                />
                <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Status Filter */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-semibold text-slate-300 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              >
                <option value="all">All Events</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="past">Past</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-semibold text-slate-300 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              >
                <option value="date">Date</option>
                <option value="popularity">Popularity</option>
                <option value="capacity">Capacity</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            <div className="lg:col-span-1 flex items-end">
              <button
                onClick={handleClearFilters}
                className="w-full px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-all border border-slate-600 flex items-center justify-center"
                title="Clear filters"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchQuery || statusFilter !== 'all' || sortBy !== 'date') && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-slate-400 text-sm">Active filters:</span>
              {searchQuery && (
                <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-sm rounded-full border border-cyan-500/30 flex items-center space-x-2">
                  <span>Search: "{searchQuery}"</span>
                  <button onClick={() => setSearchQuery('')} className="hover:text-cyan-300">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {statusFilter !== 'all' && (
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-sm rounded-full border border-emerald-500/30 flex items-center space-x-2">
                  <span>Status: {statusFilter}</span>
                  <button onClick={() => setStatusFilter('all')} className="hover:text-emerald-300">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {sortBy !== 'date' && (
                <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-sm rounded-full border border-purple-500/30 flex items-center space-x-2">
                  <span>Sort: {sortBy}</span>
                  <button onClick={() => setSortBy('date')} className="hover:text-purple-300">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
            <span>Available Events</span>
            <span className="px-3 py-1 bg-slate-700/50 rounded-full text-sm text-slate-300">
              {filteredEvents.length}
            </span>
          </h2>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start space-x-3">
            <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-red-400 font-medium">{error}</p>
              <button 
                onClick={fetchAllEvents}
                className="text-red-300 text-sm underline mt-1"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Events Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-700 border-t-cyan-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-emerald-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <p className="text-slate-400 mt-4">Loading events...</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const status = getEventStatus(event);
              const registrationOpen = isRegistrationOpen(event);
              
              return (
                <div
                  key={event.id}
                  className="relative"
                >
                  {/* Status Badge on Card */}
                  <div className="absolute top-4 right-4 z-10">
                    {status === 'ongoing' && (
                      <span className="px-3 py-1 bg-emerald-500/90 text-white text-xs font-semibold rounded-full border border-emerald-400 animate-pulse">
                        Live Now
                      </span>
                    )}
                    {status === 'upcoming' && !registrationOpen && (
                      <span className="px-3 py-1 bg-red-500/90 text-white text-xs font-semibold rounded-full border border-red-400">
                        Full
                      </span>
                    )}
                    {status === 'past' && (
                      <span className="px-3 py-1 bg-slate-500/90 text-white text-xs font-semibold rounded-full border border-slate-400">
                        Past
                      </span>
                    )}
                  </div>

                  <div
                    onClick={() => navigate(`/event/${event.id}`)}
                    className="cursor-pointer transform transition-all hover:scale-[1.02]"
                  >
                    <EventCard event={event} userRole="user" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Events Found</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? "No events match your search criteria. Try adjusting your filters."
                : "There are no events available at the moment. Check back later!"}
            </p>
            {(searchQuery || statusFilter !== 'all') && (
              <button
                onClick={handleClearFilters}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-cyan-500/25"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Stats Footer */}
        {!loading && filteredEvents.length > 0 && (
          <div className="mt-8 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
                  {filteredEvents.length}
                </div>
                <div className="text-slate-400 text-sm mt-1">Events Found</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
                  {filteredEvents.filter(e => getEventStatus(e) === 'upcoming').length}
                </div>
                <div className="text-slate-400 text-sm mt-1">Upcoming</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
                  {filteredEvents.filter(e => isRegistrationOpen(e)).length}
                </div>
                <div className="text-slate-400 text-sm mt-1">Open Registration</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
                  {filteredEvents.reduce((sum, e) => sum + (e.attendees?.length || 0), 0)}
                </div>
                <div className="text-slate-400 text-sm mt-1">Total Attendees</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// frontend/src/components/EventCard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const EventCard = ({ event, userRole = 'user', onRegister, onManage, onDelete }) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBA';
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

  // Get relative time until deadline
  const getDeadlineStatus = (deadlineString) => {
    if (!deadlineString) return null;
    
    const deadline = new Date(deadlineString);
    const now = new Date();
    const diffMs = deadline - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs < 0) {
      return { text: 'Registration closed', color: 'text-red-400', expired: true };
    } else if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return { text: `Closes in ${diffMinutes} min`, color: 'text-red-400', expired: false };
    } else if (diffHours < 24) {
      return { text: `Closes in ${diffHours}h`, color: 'text-amber-400', expired: false };
    } else if (diffDays < 7) {
      return { text: `${diffDays}d left`, color: 'text-cyan-400', expired: false };
    } else {
      return { text: `Closes ${formatDate(deadlineString)}`, color: 'text-slate-400', expired: false };
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'upcoming':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'completed':
      case 'past':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
      case 'cancelled':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'draft':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    }
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'conference':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        );
      case 'workshop':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        );
      case 'meetup':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        );
      default:
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        );
    }
  };

  const handleCardClick = () => {
    navigate(`/event/${event.id}`);
  };

  // Get attendee count safely
  const getAttendeeCount = () => {
    if (Array.isArray(event.attendees)) {
      return event.attendees.length;
    }
    if (typeof event.attendee_count === 'number') {
      return event.attendee_count;
    }
    return 0;
  };

  const deadlineStatus = getDeadlineStatus(event.deadline);

  return (
    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all duration-300 group">
      {/* Event Image */}
      <div 
        className="aspect-video bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-emerald-500/20 relative overflow-hidden cursor-pointer"
        onClick={handleCardClick}
      >
        {event.image && !imageError ? (
          <>
            <img
              src={event.image}
              alt={event.title}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-slate-700 border-t-cyan-500 rounded-full animate-spin"></div>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-16 h-16 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {getCategoryIcon(event.category)}
            </svg>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Status badge */}
        {event.status && (
          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(event.status)}`}>
              {event.status}
            </span>
          </div>
        )}

        {/* Category badge */}
        {event.category && (
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 bg-slate-900/70 backdrop-blur-sm text-slate-300 text-xs font-medium rounded-full border border-slate-700">
              {event.category}
            </span>
          </div>
        )}
      </div>

      {/* Event Details */}
      <div className="p-6">
        {/* Date and Time */}
        {(event.startDate || event.endDate) && (
          <div className="flex items-center space-x-4 mb-3 text-sm">
            {event.startDate && (
              <div className="flex items-center space-x-2 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(event.startDate)}</span>
              </div>
            )}
          </div>
        )}

        {/* Title */}
        <h3 
          className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors cursor-pointer line-clamp-2"
          onClick={handleCardClick}
        >
          {event.title}
        </h3>

        {/* Description */}
        {event.description && (
          <p className="text-slate-400 text-sm mb-4 line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Location */}
        {event.location && (
          <div className="flex items-start space-x-2 mb-4">
            <svg className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-slate-400 text-sm line-clamp-1">{event.location}</span>
          </div>
        )}

        {/* Registration Deadline */}
        {deadlineStatus && userRole === 'user' && (
          <div className="flex items-center space-x-2 mb-4">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={`text-xs font-medium ${deadlineStatus.color}`}>
              {deadlineStatus.text}
            </span>
          </div>
        )}

        {/* Footer - Stats and Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
          {/* Stats */}
          <div className="flex items-center space-x-4 text-xs text-slate-400">
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>{getAttendeeCount()} attending</span>
            </div>
            {event.capacity && (
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{event.capacity} spots</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {userRole === 'user' ? (
              // User actions - disable if deadline passed
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!deadlineStatus?.expired) {
                    onRegister?.(event.id);
                  }
                }}
                disabled={deadlineStatus?.expired}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all transform ${
                  deadlineStatus?.expired
                    ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white hover:scale-105 active:scale-95'
                }`}
              >
                {deadlineStatus?.expired ? 'Closed' : 'Register'}
              </button>
            ) : (
              // Owner actions
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onManage?.(event.id);
                  }}
                  className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg transition-all border border-slate-600"
                >
                  Manage
                </button>
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(event.id);
                    }}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all border border-red-500/30"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

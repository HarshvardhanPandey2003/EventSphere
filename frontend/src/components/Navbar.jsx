// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { useEffect, useState } from 'react';

export const Navbar = () => {
  const { user, loading, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [profileExists, setProfileExists] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoadingProfile(false);
        return;
      }
      
      try {
        if (user.role === 'user') {
          const { data } = await api.get('/api/profile/user');
          // Check if profile has any meaningful data
          const hasData = data.bio || data.phone || data.dateOfBirth || 
                         data.location || data.avatar || 
                         (data.interests && data.interests.length > 0);
          setProfileExists(hasData);
        } else if (user.role === 'owner') {
          const { data } = await api.get('/api/profile/owner');
          // Check if profile has any meaningful data
          const hasData = data.bio || data.phone || data.website || 
                         data.companyName || data.avatar || data.businessType;
          setProfileExists(hasData);
        }
      } catch (err) {
        // Profile doesn't exist or error fetching
        setProfileExists(false);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <nav className="bg-slate-900/80 backdrop-blur-lg border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-white font-bold text-2xl">
                Event<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Sphere</span>
              </span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
      try {
        await checkAuth();
      } catch (e) {
        // Expected - user logged out
      }
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <nav className="bg-slate-900/80 backdrop-blur-lg border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo and brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            
            <Link
              to={user ? '/dashboard' : '/'}
              className="flex items-center group"
            >
              <span className="text-white font-bold text-2xl">
                Event<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Sphere</span>
              </span>
            </Link>
          </div>

          {/* Auth buttons */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {loadingProfile ? (
                  <span className="text-slate-400 text-sm">Loading...</span>
                ) : profileExists ? (
                  <Link
                    to={user.role === 'owner' ? '/owner/profile' : '/profile'}
                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-semibold text-sm rounded-lg transition-all shadow-lg shadow-cyan-500/25 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Profile</span>
                  </Link>
                ) : (
                  <Link
                    to={user.role === 'owner' ? '/owner/profile/create' : '/profile/create'}
                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-semibold text-sm rounded-lg transition-all shadow-lg shadow-cyan-500/25 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Create Profile</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold text-sm rounded-lg transition-all shadow-lg shadow-red-500/25 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className="px-5 py-2.5 text-slate-300 hover:text-white font-medium text-sm transition-colors"
                >
                  Sign Up
                </Link>
                <Link
                  to="/login"
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-semibold text-sm rounded-lg transition-all shadow-lg shadow-cyan-500/25"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

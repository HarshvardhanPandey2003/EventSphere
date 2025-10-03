// frontend/src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { useEffect, useState } from 'react';
import '../output.css';

export const Navbar = () => {
  const { user, loading, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [profileExists, setProfileExists] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        if (user.role === 'freelancer') {
          await api.get('/api/profile/freelancer');
        } else if (user.role === 'client') {
          await api.get('/api/profile/client');
        }
        setProfileExists(true);
      } catch {
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
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <span className="text-white font-bold text-xl">EventSphere</span>
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
        await checkAuth(); // Expected to fail
      } catch (e) {
        // Ignore error - user is logged out
      }
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleBrandClick = (e) => {
    if (!user) {
      e.preventDefault();
      navigate('/');
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
              onClick={handleBrandClick}
              className="flex items-center group"
            >
              <span className="text-white font-bold text-2xl">
                Event<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Sphere</span>
              </span>
            </Link>
          </div>

          {/* Navigation links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/learn" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
              Learn
            </Link>
            <Link to="/app" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
              App
            </Link>
            <Link to="/community" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
              Community
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
                    to={
                      user.role === 'freelancer'
                        ? '/freelancer-profile'
                        : '/client-profile'
                    }
                    className="px-5 py-2.5 text-slate-300 hover:text-white font-medium text-sm transition-colors"
                  >
                    Profile
                  </Link>
                ) : (
                  <Link
                    to={
                      user.role === 'freelancer'
                        ? '/create-freelancer-profile'
                        : '/create-client-profile'
                    }
                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-semibold text-sm rounded-lg transition-all shadow-lg shadow-cyan-500/25"
                  >
                    Create Profile
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-5 py-2.5 bg-slate-700/50 hover:bg-slate-700 text-white font-medium text-sm rounded-lg transition-all border border-slate-600"
                >
                  Logout
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

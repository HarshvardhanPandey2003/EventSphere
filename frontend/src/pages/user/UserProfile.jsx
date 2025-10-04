// src/pages/user/UserProfile.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { Navbar } from '../../components/Navbar';

export const UserProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/profile/user');
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.response?.data?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const hasProfileData = () => {
    if (!profile) return false;
    return profile.bio || profile.phone || profile.dateOfBirth || 
           profile.location || profile.avatar || 
           (profile.interests && profile.interests.length > 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-cyan-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-400 mt-4">Loading profile...</p>
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">My Profile</h1>
                <p className="text-slate-400 text-sm">Manage your personal information</p>
              </div>
            </div>
            
            {hasProfileData() ? (
              <button
                onClick={() => navigate('/profile/edit')}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-cyan-500/25 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/profile/create')}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-cyan-500/25 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Create Profile</span>
              </button>
            )}
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

        {!hasProfileData() ? (
          // Empty State
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Profile Yet</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Create your profile to personalize your experience and let others know more about you!
            </p>
            <button
              onClick={() => navigate('/profile/create')}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-cyan-500/25"
            >
              Create Your Profile
            </button>
          </div>
        ) : (
          // Profile Content
          <div className="space-y-6">
            {/* Profile Header Card */}
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 lg:p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                {/* Avatar */}
                <div className="relative">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.username}
                      className="w-32 h-32 rounded-full object-cover border-4 border-cyan-500/30"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-full flex items-center justify-center border-4 border-cyan-500/30">
                      <span className="text-5xl font-bold text-white">
                        {profile.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-500 rounded-full border-4 border-slate-800 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-bold text-white mb-2">{profile.username}</h2>
                  <p className="text-slate-400 mb-4">{profile.email}</p>
                  
                  {profile.bio && (
                    <p className="text-slate-300 leading-relaxed mb-4">{profile.bio}</p>
                  )}

                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-sm font-medium rounded-full border border-cyan-500/30">
                      {profile.role}
                    </span>
                    {profile.location && (
                      <span className="px-3 py-1 bg-slate-700/50 text-slate-300 text-sm font-medium rounded-full border border-slate-600 flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{profile.location}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 lg:p-8">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Contact Information</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-slate-400 mb-2 block">Email</label>
                  <p className="text-white">{profile.email}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-400 mb-2 block">Phone</label>
                  <p className="text-white">{profile.phone || 'Not provided'}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-400 mb-2 block">Location</label>
                  <p className="text-white">{profile.location || 'Not provided'}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-400 mb-2 block">Date of Birth</label>
                  <p className="text-white">{formatDate(profile.dateOfBirth)}</p>
                </div>
              </div>
            </div>

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 lg:p-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <span>Interests</span>
                </h3>

                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 text-cyan-300 rounded-lg border border-cyan-500/30 font-medium"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Social Links */}
            {profile.socialLinks && Object.keys(profile.socialLinks).length > 0 && (
              <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 lg:p-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span>Social Links</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(profile.socialLinks).map(([platform, url]) => (
                    url && (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 p-4 bg-slate-700/30 rounded-lg border border-slate-600 hover:border-cyan-500/50 transition-all group"
                      >
                        <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                          <span className="text-lg capitalize">{platform.charAt(0)}</span>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-slate-400 text-xs capitalize">{platform}</p>
                          <p className="text-white text-sm truncate">{url}</p>
                        </div>
                        <svg className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

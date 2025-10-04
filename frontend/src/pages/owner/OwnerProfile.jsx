// src/pages/owner/OwnerProfile.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { Navbar } from '../../components/Navbar';

export const OwnerProfile = () => {
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
      const { data } = await api.get('/api/profile/owner');
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.response?.data?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const hasProfileData = () => {
    if (!profile) return false;
    return profile.bio || profile.phone || profile.website || 
           profile.companyName || profile.avatar || profile.businessType;
  };

  const getVerificationBadge = (status) => {
    switch (status) {
      case 'verified':
        return (
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-sm font-semibold rounded-full border border-emerald-500/30 flex items-center space-x-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Verified</span>
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1 bg-orange-500/10 text-orange-400 text-sm font-semibold rounded-full border border-orange-500/30">
            Pending Verification
          </span>
        );
      default:
        return null;
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Business Profile</h1>
                <p className="text-slate-400 text-sm">Manage your organization details</p>
              </div>
            </div>
            
            {hasProfileData() ? (
              <button
                onClick={() => navigate('/owner/profile/edit')}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-cyan-500/25 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/owner/profile/create')}
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
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <span className="text-red-400">{error}</span>
          </div>
        )}

        {!hasProfileData() ? (
          // Empty State
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Business Profile Yet</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Create your business profile to showcase your organization and build credibility with attendees!
            </p>
            <button
              onClick={() => navigate('/owner/profile/create')}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-cyan-500/25"
            >
              Create Business Profile
            </button>
          </div>
        ) : (
          // Profile Content
          <div className="space-y-6">
            {/* Profile Header Card */}
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 lg:p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                {/* Avatar/Logo */}
                <div className="relative">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.companyName || profile.username}
                      className="w-32 h-32 rounded-full object-cover border-4 border-cyan-500/30"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-full flex items-center justify-center border-4 border-cyan-500/30">
                      <span className="text-5xl font-bold text-white">
                        {(profile.companyName || profile.username)?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  {profile.verificationStatus === 'verified' && (
                    <div className="absolute bottom-0 right-0 w-10 h-10 bg-emerald-500 rounded-full border-4 border-slate-800 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Business Info */}
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {profile.companyName || profile.username}
                  </h2>
                  <p className="text-slate-400 mb-4">{profile.email}</p>
                  
                  {profile.bio && (
                    <p className="text-slate-300 leading-relaxed mb-4">{profile.bio}</p>
                  )}

                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    {getVerificationBadge(profile.verificationStatus)}
                    {profile.businessType && (
                      <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-sm font-medium rounded-full border border-purple-500/30">
                        {profile.businessType}
                      </span>
                    )}
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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-lg p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center border border-cyan-500/20">
                    <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">{profile.totalEvents || 0}</div>
                    <div className="text-slate-400 text-sm">Total Events</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-lg p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">
                      {profile.verificationStatus === 'verified' ? 'Yes' : 'No'}
                    </div>
                    <div className="text-slate-400 text-sm">Verified</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-lg p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center border border-purple-500/20">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">{profile.businessType || 'N/A'}</div>
                    <div className="text-slate-400 text-sm">Business Type</div>
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
                  <label className="text-sm font-semibold text-slate-400 mb-2 block">Website</label>
                  {profile.website ? (
                    <a 
                      href={profile.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center space-x-1"
                    >
                      <span>{profile.website}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ) : (
                    <p className="text-white">Not provided</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-400 mb-2 block">Location</label>
                  <p className="text-white">{profile.location || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            {profile.socialLinks && Object.keys(profile.socialLinks).length > 0 && (
              <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 lg:p-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span>Social Media</span>
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

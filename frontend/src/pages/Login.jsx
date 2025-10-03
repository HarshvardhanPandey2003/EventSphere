// frontend/src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Navbar } from '../components/Navbar';
import '../output.css';
import { useAuth } from '../hooks/useAuth';

export const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user' // Default to 'user'
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/auth/login', formData);
      await checkAuth();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden">
      <Navbar />

      {/* Gradient orbs background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-80px)] py-12">
          
          {/* Left side - Hero content */}
          <div className="text-left space-y-8 animate-fade-in">
            <div className="inline-block px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
              <span className="text-emerald-400 text-sm font-semibold">Secure Login Portal</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="text-white">Welcome Back to</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400">
                EventSphere
              </span>
            </h1>

            <p className="text-lg text-slate-300 leading-relaxed max-w-xl">
              Access your account to manage events, connect with attendees, and create 
              unforgettable experiences. Whether you're an event owner or attendee, 
              EventSphere has everything you need.
            </p>

            {/* Feature highlights */}
            <div className="space-y-4 pt-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center flex-shrink-0 border border-cyan-500/20">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">For Event Owners</h3>
                  <p className="text-slate-400 text-sm">Create, manage, and promote your events with powerful tools</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">For Users</h3>
                  <p className="text-slate-400 text-sm">Discover and register for amazing events in your area</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Login form */}
          <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto animate-slide-in-right">
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
              
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Sign In</h2>
                <p className="text-slate-400">Enter your credentials to continue</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start space-x-3">
                  <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Role Selection - Compact Version */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'user' })}
                      className={`py-2.5 px-3 rounded-lg border-2 transition-all ${
                        formData.role === 'user'
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-slate-600 bg-slate-900/50 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <svg className={`w-5 h-5 ${formData.role === 'user' ? 'text-emerald-400' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className={`font-medium text-sm ${formData.role === 'user' ? 'text-emerald-400' : 'text-slate-300'}`}>
                          User
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'owner' })}
                      className={`py-2.5 px-3 rounded-lg border-2 transition-all ${
                        formData.role === 'owner'
                          ? 'border-cyan-500 bg-cyan-500/10'
                          : 'border-slate-600 bg-slate-900/50 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <svg className={`w-5 h-5 ${formData.role === 'owner' ? 'text-cyan-400' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className={`font-medium text-sm ${formData.role === 'owner' ? 'text-cyan-400' : 'text-slate-300'}`}>
                          Owner
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                      onClick={() => navigate('/forgot-password')}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-cyan-500/25 mt-6"
                >
                  Sign In as {formData.role === 'owner' ? 'Owner' : 'User'}
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-slate-800/40 text-slate-400">New to EventSphere?</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="w-full py-3.5 px-6 bg-slate-700/50 hover:bg-slate-700 text-white font-semibold rounded-lg transition-all text-center border border-slate-600"
                >
                  Create an Account
                </button>
              </form>
            </div>

            {/* Security badge */}
            <div className="mt-6 flex items-center justify-center space-x-2 text-slate-500 text-sm">
              <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Your connection is secure and encrypted</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// frontend/src/pages/SignUp.jsx
import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { api } from '../services/api';
import { Navbar } from '../components/Navbar';
import '../output.css';

export const SignUp = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'owner'
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/auth/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Registration failed');
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
            <div className="inline-block px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
              <span className="text-cyan-400 text-sm font-semibold">Event Management Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="text-white">Welcome to the</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400">
                Ultimate Experience
              </span>
            </h1>

            <p className="text-lg text-slate-300 leading-relaxed max-w-xl">
              EventSphere connects event organizers and attendees with cutting-edge technology. 
              Create, manage, and experience extraordinary events with seamless registration 
              and powerful tools at your fingertips.
            </p>

            <div className="flex items-center space-x-8 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400">1000+</div>
                <div className="text-sm text-slate-400 mt-1">Events Hosted</div>
              </div>
              <div className="w-px h-12 bg-slate-700"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-400">50K+</div>
                <div className="text-sm text-slate-400 mt-1">Active Users</div>
              </div>
              <div className="w-px h-12 bg-slate-700"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400">24/7</div>
                <div className="text-sm text-slate-400 mt-1">Support</div>
              </div>
            </div>
          </div>

          {/* Right side - Sign up form */}
          <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto animate-slide-in-right">
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
              
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                <p className="text-slate-400">Join EventSphere today</p>
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
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
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
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Account Type
                  </label>
                  <div className="relative">
                    <select
                      value={formData.role}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all cursor-pointer"
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="owner" className="bg-slate-900">Event Owner</option>
                      <option value="user" className="bg-slate-900">Attendee</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-cyan-500/25 mt-6"
                >
                  Create Account
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-slate-800/40 text-slate-400">Already have an account?</span>
                  </div>
                </div>

                <RouterLink
                  to="/login"
                  className="block w-full py-3.5 px-6 bg-slate-700/50 hover:bg-slate-700 text-white font-semibold rounded-lg transition-all text-center border border-slate-600"
                >
                  Login Instead
                </RouterLink>
              </form>
            </div>

            {/* Trust indicators */}
            <div className="mt-6 flex items-center justify-center space-x-6 text-slate-500 text-sm">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Secure & Encrypted</span>
              </div>
              <div className="w-px h-4 bg-slate-700"></div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span>No spam, ever</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

// frontend/src/pages/Dashboard.jsx
import { useAuth } from '../hooks/useAuth';
import { UserDashboard } from './user/UserDashboard';
import { OwnerDashboard } from './owner/OwnerDashboard';

export const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          {/* Spinner */}
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-cyan-500 border-r-emerald-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-400 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {user?.role === 'user' ? <UserDashboard /> : <OwnerDashboard />}
    </main>
  );
};

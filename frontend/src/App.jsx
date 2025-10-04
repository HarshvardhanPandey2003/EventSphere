// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SignUp } from './pages/SignUp';
import { Login } from './pages/Login';
import { PrivateRoute } from './routes/PrivateRoute';
import { Dashboard } from './pages/Dashboard';
import { CreateEvent } from './pages/owner/CreateEvent';
import { OwnerEventDetails } from './pages/owner/OwnerEventDetails';
import { EditEvent } from './pages/owner/EditEvent';  // ADD THIS
import { UserEventDetails } from './pages/user/UserEventDetails';  // ADD THIS
import { AuthProvider } from './hooks/useAuth';

export const App = () => (
  <Router>
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes - Available to all authenticated users */}
        <Route element={<PrivateRoute allowedRoles={['user', 'owner']} />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        {/* Owner-Only Routes */}
        <Route element={<PrivateRoute allowedRoles={['owner']} />}>
          <Route path="/owner/create-event" element={<CreateEvent />} />
          <Route path="/owner/event/:id" element={<OwnerEventDetails />} />
          <Route path="/owner/edit-event/:id" element={<EditEvent />} />  {/* ADD THIS */}
        </Route>
        <Route element={<PrivateRoute allowedRoles={['user']} />}>
          <Route path="/event/:id" element={<UserEventDetails />} />  {/* ADD THIS */}
        </Route>
      </Routes>
    </AuthProvider>
  </Router>
);

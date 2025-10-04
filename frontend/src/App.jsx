// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SignUp } from './pages/SignUp';
import { Login } from './pages/Login';
import { PrivateRoute } from './routes/PrivateRoute';
import { Dashboard } from './pages/Dashboard';
import { AuthProvider } from './hooks/useAuth';

// User Pages
import { UserProfile } from './pages/user/UserProfile';
import { CreateUserProfile } from './pages/user/CreateUserProfile';
import { EditUserProfile } from './pages/user/EditUserProfile';
import { UserEventDetails } from './pages/user/UserEventDetails';
import { EventsPage } from './pages/user/EventsPage';  // ADD THIS

// Owner Pages
import { CreateEvent } from './pages/owner/CreateEvent';
import { OwnerEventDetails } from './pages/owner/OwnerEventDetails';
import { EditEvent } from './pages/owner/EditEvent';
import { OwnerProfile } from './pages/owner/OwnerProfile';
import { CreateOwnerProfile } from './pages/owner/CreateOwnerProfile';
import { EditOwnerProfile } from './pages/owner/EditOwnerProfile';

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

        {/* User-Only Routes */}
        <Route element={<PrivateRoute allowedRoles={['user']} />}>
          {/* User Profile Management */}
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/profile/create" element={<CreateUserProfile />} />
          <Route path="/profile/edit" element={<EditUserProfile />} />
          
          {/* User Event Access */}
          <Route path="/events" element={<EventsPage />} />  {/* ADD THIS */}
          <Route path="/event/:id" element={<UserEventDetails />} />
        </Route>

        {/* Owner-Only Routes */}
        <Route element={<PrivateRoute allowedRoles={['owner']} />}>
          {/* Event Management */}
          <Route path="/owner/create-event" element={<CreateEvent />} />
          <Route path="/owner/event/:id" element={<OwnerEventDetails />} />
          <Route path="/owner/edit-event/:id" element={<EditEvent />} />
          
          {/* Owner Profile Management */}
          <Route path="/owner/profile" element={<OwnerProfile />} />
          <Route path="/owner/profile/create" element={<CreateOwnerProfile />} />
          <Route path="/owner/profile/edit" element={<EditOwnerProfile />} />
        </Route>
      </Routes>
    </AuthProvider>
  </Router>
);

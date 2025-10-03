// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SignUp } from './pages/SignUp';
import { Login } from './pages/Login';
import { Navbar } from './components/Navbar';
import { PrivateRoute } from './routes/PrivateRoute';
import { Dashboard } from './pages/Dashboard';


export const App = () => (
  <Router>
    <Routes>
        <Route path="/" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          element={
            <>
              <Navbar />
              <PrivateRoute allowedRoles={['user', 'owner']} />
            </>
          }
        ></Route>
    </Routes>
  </Router>
);

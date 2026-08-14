import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import UserStore from './pages/UserStore';
import OwnerDashboard from './pages/OwnerDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  const { user } = useAuth();

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/user/*" element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserStore />
          </ProtectedRoute>
        } />
        
        <Route path="/owner/*" element={
          <ProtectedRoute allowedRoles={['owner']}>
            <OwnerDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/" element={
          user ? (
            user.role === 'admin' ? <Navigate to="/admin" /> :
            user.role === 'owner' ? <Navigate to="/owner" /> :
            <Navigate to="/user" />
          ) : (
            <Navigate to="/login" />
          )
        } />
      </Routes>
    </>
  );
}

export default App;
import React from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <nav style={{
      backgroundColor: '#333',
      color: 'white',
      padding: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Store Rating App</div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {!user ? (
          <>
            <button onClick={() => navigate('/login')} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Login</button>
            <button onClick={() => navigate('/signup')} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Signup</button>
          </>
        ) : (
          <>
            <span>{user.email} ({user.role})</span>
            <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
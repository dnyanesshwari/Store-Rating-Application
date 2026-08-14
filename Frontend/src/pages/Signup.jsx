import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { auth } from '../api';
import toast from 'react-hot-toast';
import './Auth.css';

const Signup = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await auth.signup(formData);
      const { token, user } = response.data;
      loginUser(user, token);
      toast.success('Account created successfully!');
      navigate('/user');
    } catch (error) {
      const message = error.response?.data?.error || 'Signup failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              minLength={20}
              maxLength={60}
              placeholder="Enter your full name (min 20 chars)"
            />
            <small>Min 20 characters, Max 60 characters</small>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={8}
              maxLength={16}
              placeholder="Enter password"
            />
            <small>8-16 chars, at least 1 uppercase & 1 special character</small>
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              maxLength={400}
              placeholder="Enter your address (max 400 chars)"
              rows="3"
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
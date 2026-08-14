import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { owner, auth } from '../api';
import toast from 'react-hot-toast';
import './Dashboard.css';

const OwnerDashboard = () => {
  const { user, logoutUser } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    stores: [],
    ratings: [],
    averageRating: 0,
    totalRatings: 0
  });
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await owner.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    try {
      await auth.updatePassword(passwordData);
      toast.success('Password updated successfully!');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update password');
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Store Owner Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.name}</span>
          <button onClick={() => setShowPasswordModal(true)} className="btn-secondary">
            Change Password
          </button>
          <button onClick={logoutUser} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="owner-stats">
        <div className="stat-card">
          <h3>Your Stores</h3>
          <p className="stat-number">{dashboardData.stores.length}</p>
        </div>
        <div className="stat-card">
          <h3>Average Rating</h3>
          <p className="stat-number">{dashboardData.averageRating ? Number(dashboardData.averageRating).toFixed(1) : 'N/A'}</p>
        </div>
        <div className="stat-card">
          <h3>Total Ratings Received</h3>
          <p className="stat-number">{dashboardData.totalRatings}</p>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading dashboard...</div>
      ) : (
        <>
          {dashboardData.stores.length === 0 ? (
            <div className="no-stores-message">
              <p>You don't have any stores assigned yet. Contact an admin to get a store assigned.</p>
            </div>
          ) : (
            <>
              <h2 className="section-title">Your Stores</h2>
              <div className="stores-grid">
                {dashboardData.stores.map((store) => (
                  <div key={store.id} className="store-card">
                    <h3>{store.name}</h3>
                    <p><strong>Email:</strong> {store.email}</p>
                    <p><strong>Address:</strong> {store.address}</p>
                  </div>
                ))}
              </div>

              <h2 className="section-title">Recent Ratings</h2>
              {dashboardData.ratings.length === 0 ? (
                <p className="no-ratings">No ratings received yet.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Store</th>
                      <th>Rating</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.ratings.map((rating) => (
                      <tr key={rating.id}>
                        <td>{rating.user_name}</td>
                        <td>{rating.user_email}</td>
                        <td>{rating.store_name}</td>
                        <td>⭐ {rating.rating}</td>
                        <td>{new Date(rating.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Change Password</h2>
            <form onSubmit={handlePasswordUpdate}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  minLength={8}
                  maxLength={16}
                />
                <small>8-16 chars, at least 1 uppercase & 1 special character</small>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Update Password</button>
                <button type="button" onClick={() => setShowPasswordModal(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;

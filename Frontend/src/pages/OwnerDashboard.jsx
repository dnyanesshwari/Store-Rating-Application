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
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">★</span>
          <span>StoreRate</span>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active">
            <span className="nav-dot" /> Dashboard
          </button>
          <button className="nav-item">
            <span className="nav-dot" /> My Stores
          </button>
          <button className="nav-item">
            <span className="nav-dot" /> Ratings
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar">{user?.name?.charAt(0)?.toUpperCase() || 'O'}</div>
            <div>
              <div>{user?.name}</div>
              <small>Owner</small>
            </div>
          </div>
          <button className="btn-ghost" style={{ width: '100%', marginTop: '12px' }} onClick={logoutUser}>Log out</button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="topbar">
          <div className="topbar-title">
            <h2>Owner Dashboard</h2>
            <div className="topbar-subtitle">Welcome back, {user?.name}</div>
          </div>
          <div className="topbar-actions">
            <button className="btn-secondary" onClick={() => setShowPasswordModal(true)}>Change Password</button>
            <span className="user-pill"><span className="mini-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'O'}</span>{user?.name}</span>
          </div>
        </header>

        <div className="dashboard-page">
          <div className="metric-grid">
            <div className="metric-card metric-card--accent">
              <div className="metric-card__header">
                <span className="metric-card__label">Your Stores</span>
                <span className="metric-card__icon">🏪</span>
              </div>
              <div className="metric-card__value">{dashboardData.stores.length}</div>
              <div className="metric-card__meta positive">Active listings</div>
            </div>

            <div className="metric-card">
              <div className="metric-card__header">
                <span className="metric-card__label">Average Rating</span>
                <span className="metric-card__icon">⭐</span>
              </div>
              <div className="metric-card__value">{dashboardData.averageRating ? Number(dashboardData.averageRating).toFixed(1) : 'N/A'}</div>
              <div className="metric-card__meta positive">Customer satisfaction</div>
            </div>

            <div className="metric-card">
              <div className="metric-card__header">
                <span className="metric-card__label">Total Ratings</span>
                <span className="metric-card__icon">📊</span>
              </div>
              <div className="metric-card__value">{dashboardData.totalRatings}</div>
              <div className="metric-card__meta positive">Received so far</div>
            </div>

            <div className="metric-card">
              <div className="metric-card__header">
                <span className="metric-card__label">Status</span>
                <span className="metric-card__icon">✅</span>
              </div>
              <div className="metric-card__value">Live</div>
              <div className="metric-card__meta positive">Healthy profile</div>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading dashboard...</div>
          ) : (
            <>
              {dashboardData.stores.length === 0 ? (
                <div className="panel empty-state">
                  <p>You don't have any stores assigned yet. Contact an admin to get a store assigned.</p>
                </div>
              ) : (
                <>
                  <div className="panel">
                    <div className="panel-header">
                      <h3 className="panel-title">Your Stores</h3>
                    </div>
                    <div className="store-grid">
                      {dashboardData.stores.map((store) => (
                        <div key={store.id} className="store-card">
                          <div className="store-card__image" />
                          <div className="store-card__body">
                            <div className="store-card__top">
                              <h3 className="store-card__name">{store.name}</h3>
                              <span className="star-row">★ {dashboardData.averageRating ? Number(dashboardData.averageRating).toFixed(1) : 'N/A'}</span>
                            </div>
                            <div className="store-card__meta">
                              <div><strong>Email:</strong> {store.email}</div>
                              <div><strong>Address:</strong> {store.address}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="panel table-panel">
                    <div className="panel-header">
                      <h3 className="panel-title">Recent Ratings</h3>
                    </div>
                    <div className="table-scroll">
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
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>

      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>Change Password</h2>
            <form onSubmit={handlePasswordUpdate}>
              <div className="form-group">
                <label>Current Password</label>
                <input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} required minLength={8} maxLength={16} />
                <small>8-16 characters, at least 1 uppercase and 1 special character</small>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Update Password</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;

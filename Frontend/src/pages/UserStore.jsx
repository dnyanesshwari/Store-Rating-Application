import React, { useEffect, useState } from 'react';
import { getStores, submitRating, auth } from '../api';
import StoreCard from '../components/StoreCard';
import { useAuth } from '../AuthContext';
import toast from 'react-hot-toast';
import './Dashboard.css';

function UserStore() {
  const { user, logoutUser } = useAuth();
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState({ query: '' });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });

  const loadStores = async () => {
    try {
      const res = await getStores({ query: search.query });
      const payload = res.data || {};
      setStores(Array.isArray(payload) ? payload : payload.items || []);
    } catch (error) {
      console.error('Failed to load stores', error);
      setStores([]);
    }
  };

  useEffect(() => {
    loadStores();
  }, [search.query]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadStores();
  };

  const handleRate = async (storeId, rating) => {
    try {
      await submitRating(storeId, rating);
      loadStores();
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to submit rating');
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
            <span className="nav-dot" /> Browse Stores
          </button>
          <button className="nav-item">
            <span className="nav-dot" /> My Reviews
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
            <div>
              <div>{user?.name}</div>
              <small>User</small>
            </div>
          </div>
          <button className="btn-ghost" style={{ width: '100%', marginTop: '12px' }} onClick={logoutUser}>Log out</button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="topbar">
          <div className="topbar-title">
            <h2>Browse Stores</h2>
            <div className="topbar-subtitle">Search your next favorite place</div>
          </div>
          <div className="topbar-actions">
            <button className="btn-secondary" onClick={() => setShowPasswordModal(true)}>Change Password</button>
            <span className="user-pill"><span className="mini-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>{user?.name}</span>
          </div>
        </header>

        <div className="dashboard-page">
          <section className="panel">
            <div className="panel-header">
              <h3 className="panel-title">Discover stores</h3>
            </div>
            <form onSubmit={handleSearch} className="search-bar">
              <input
                placeholder="Search stores by name or address"
                value={search.query}
                onChange={(e) => setSearch({ query: e.target.value })}
              />
              <button type="submit" className="btn-primary">Search</button>
            </form>
          </section>

          <section className="store-grid">
            {stores.map((store) => (
              <StoreCard key={store.id} store={store} onRate={handleRate} />
            ))}
          </section>
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
}

export default UserStore;
import React, { useEffect, useState } from 'react';
import { getStores, submitRating } from '../api';
import StoreCard from '../components/StoreCard';
import { useAuth } from '../AuthContext';
import './Dashboard.css';

function UserStore() {
  const { user, logoutUser } = useAuth();
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState({ query: '' });

  const loadStores = async () => {
    const res = await getStores({ query: search.query });
    setStores(res.data);
  };

  useEffect(() => {
    loadStores();
  }, []);

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
    </div>
  );
}

export default UserStore;
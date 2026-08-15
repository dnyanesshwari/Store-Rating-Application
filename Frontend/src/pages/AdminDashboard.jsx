import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { admin } from '../api';
import toast from 'react-hot-toast';
import './Dashboard.css';

const AdminDashboard = () => {
  const { user, logoutUser } = useAuth();
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [showUserForm, setShowUserForm] = useState(false);
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', address: '', role: 'user' });
  const [newStore, setNewStore] = useState({ name: '', email: '', address: '', ownerId: '' });
  
  // Filter states
  const [userFilters, setUserFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [storeFilters, setStoreFilters] = useState({ name: '', email: '', address: '' });

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchStores();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await admin.getStats();
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to fetch stats');
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await admin.getUsers(userFilters);
      const payload = response.data;
      setUsers(Array.isArray(payload) ? payload : payload.items || []);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    setLoading(true);
    try {
      const response = await admin.getStores(storeFilters);
      const payload = response.data;
      setStores(Array.isArray(payload) ? payload : payload.items || []);
    } catch (error) {
      toast.error('Failed to fetch stores');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await admin.createUser(newUser);
      toast.success('User created successfully');
      setShowUserForm(false);
      setNewUser({ name: '', email: '', password: '', address: '', role: 'user' });
      fetchUsers();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create user');
    }
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    try {
      await admin.createStore(newStore);
      toast.success('Store created successfully');
      setShowStoreForm(false);
      setNewStore({ name: '', email: '', address: '', ownerId: '' });
      fetchStores();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create store');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await admin.deleteUser(userId);
      toast.success('User deleted successfully');
      fetchUsers();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete user');
    }
  };

  const handleDeleteStore = async (storeId) => {
    if (!window.confirm('Are you sure you want to delete this store?')) return;
    try {
      await admin.deleteStore(storeId);
      toast.success('Store deleted successfully');
      fetchStores();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete store');
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
          <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <span className="nav-dot" /> Dashboard
          </button>
          <button className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <span className="nav-dot" /> Users ({users.length})
          </button>
          <button className={`nav-item ${activeTab === 'stores' ? 'active' : ''}`} onClick={() => setActiveTab('stores')}>
            <span className="nav-dot" /> Stores ({stores.length})
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar">{user?.name?.charAt(0)?.toUpperCase() || 'A'}</div>
            <div>
              <div>{user?.name}</div>
              <small>{user?.role}</small>
            </div>
          </div>
          <button className="btn-ghost" style={{ width: '100%', marginTop: '12px' }} onClick={logoutUser}>Log out</button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="topbar">
          <div className="topbar-title">
            <h2>Admin Dashboard</h2>
            <div className="topbar-subtitle">Welcome back, {user?.name}</div>
          </div>
          <div className="topbar-actions">
            <span className="user-pill"><span className="mini-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'A'}</span>{user?.name}</span>
          </div>
        </header>

        <div className="dashboard-page">
          {activeTab === 'dashboard' && (
            <>
              <div className="metric-grid">
                <div className="metric-card metric-card--accent">
                  <div className="metric-card__header">
                    <span className="metric-card__label">Total Users</span>
                    <span className="metric-card__icon">👥</span>
                  </div>
                  <div className="metric-card__value">{stats.totalUsers}</div>
                  <div className="metric-card__meta positive">+12% from last month</div>
                </div>

                <div className="metric-card">
                  <div className="metric-card__header">
                    <span className="metric-card__label">Total Stores</span>
                    <span className="metric-card__icon">🏪</span>
                  </div>
                  <div className="metric-card__value">{stats.totalStores}</div>
                  <div className="metric-card__meta positive">+8% from last month</div>
                </div>

                <div className="metric-card">
                  <div className="metric-card__header">
                    <span className="metric-card__label">Total Ratings</span>
                    <span className="metric-card__icon">⭐</span>
                  </div>
                  <div className="metric-card__value">{stats.totalRatings}</div>
                  <div className="metric-card__meta positive">+15% from last month</div>
                </div>

                <div className="metric-card">
                  <div className="metric-card__header">
                    <span className="metric-card__label">Quick Actions</span>
                    <span className="metric-card__icon">⚡</span>
                  </div>
                  <div className="metric-card__meta" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '18px' }}>
                    <button onClick={() => setShowUserForm(true)} className="btn-primary">Add User</button>
                    <button onClick={() => setShowStoreForm(true)} className="btn-secondary">Add Store</button>
                  </div>
                </div>
              </div>

              <div className="panel table-panel">
                <div className="panel-header">
                  <h3 className="panel-title">Recent Users</h3>
                  <button className="btn-secondary" onClick={() => setActiveTab('users')}>View all</button>
                </div>
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.slice(0, 5).map((item) => (
                        <tr key={item.id}>
                          <td>{item.name}</td>
                          <td>{item.email}</td>
                          <td><span className={`role-badge ${item.role}`}>{item.role}</span></td>
                          <td>{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'users' && (
            <div className="panel table-panel">
              <div className="panel-header">
                <h3 className="panel-title">Users</h3>
                <button className="btn-primary" onClick={() => setShowUserForm(true)}>Add User</button>
              </div>
              <div className="table-filter-row">
                <input type="text" placeholder="Filter by name" value={userFilters.name} onChange={(e) => setUserFilters({ ...userFilters, name: e.target.value })} onKeyPress={(e) => e.key === 'Enter' && fetchUsers()} />
                <input type="text" placeholder="Filter by email" value={userFilters.email} onChange={(e) => setUserFilters({ ...userFilters, email: e.target.value })} onKeyPress={(e) => e.key === 'Enter' && fetchUsers()} />
                <input type="text" placeholder="Filter by address" value={userFilters.address} onChange={(e) => setUserFilters({ ...userFilters, address: e.target.value })} onKeyPress={(e) => e.key === 'Enter' && fetchUsers()} />
                <select value={userFilters.role} onChange={(e) => setUserFilters({ ...userFilters, role: e.target.value })}>
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                  <option value="owner">Owner</option>
                </select>
                <button className="btn-secondary" onClick={fetchUsers}>Apply</button>
              </div>
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Address</th>
                      <th>Role</th>
                      <th>Rating</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.email}</td>
                        <td>{item.address || 'N/A'}</td>
                        <td><span className={`role-badge ${item.role}`}>{item.role}</span></td>
                        <td>{item.role === 'owner' ? (item.rating ? Number(item.rating).toFixed(1) : 'No ratings') : '-'}</td>
                        <td>
                          {item.role !== 'admin' && (
                            <button onClick={() => handleDeleteUser(item.id)} className="btn-danger">Delete</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'stores' && (
            <div className="panel table-panel">
              <div className="panel-header">
                <h3 className="panel-title">Stores</h3>
                <button className="btn-primary" onClick={() => setShowStoreForm(true)}>Add Store</button>
              </div>
              <div className="table-filter-row">
                <input type="text" placeholder="Filter by name" value={storeFilters.name} onChange={(e) => setStoreFilters({ ...storeFilters, name: e.target.value })} onKeyPress={(e) => e.key === 'Enter' && fetchStores()} />
                <input type="text" placeholder="Filter by email" value={storeFilters.email} onChange={(e) => setStoreFilters({ ...storeFilters, email: e.target.value })} onKeyPress={(e) => e.key === 'Enter' && fetchStores()} />
                <input type="text" placeholder="Filter by address" value={storeFilters.address} onChange={(e) => setStoreFilters({ ...storeFilters, address: e.target.value })} onKeyPress={(e) => e.key === 'Enter' && fetchStores()} />
                <button className="btn-secondary" onClick={fetchStores}>Apply</button>
              </div>
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Address</th>
                      <th>Owner</th>
                      <th>Average Rating</th>
                      <th>Total Ratings</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stores.map((store) => (
                      <tr key={store.id}>
                        <td>{store.name}</td>
                        <td>{store.email}</td>
                        <td>{store.address}</td>
                        <td>{store.owner_name || 'Unassigned'}</td>
                        <td>{store.average_rating ? Number(store.average_rating).toFixed(1) : 'N/A'}</td>
                        <td>{store.total_ratings || 0}</td>
                        <td><button onClick={() => handleDeleteStore(store.id)} className="btn-danger">Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {showUserForm && (
        <div className="modal-overlay" onClick={() => setShowUserForm(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>Add New User</h2>
            <form onSubmit={handleCreateUser}>
              <div className="form-grid">
                <div className="form-group field-wide">
                  <label>Name (20-60 chars)</label>
                  <input type="text" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} required minLength={20} maxLength={60} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required minLength={8} maxLength={16} />
                </div>
                <div className="form-group field-wide">
                  <label>Address</label>
                  <textarea value={newUser.address} onChange={(e) => setNewUser({ ...newUser, address: e.target.value })} rows="2" maxLength={400} />
                </div>
                <div className="form-group field-wide">
                  <label>Role</label>
                  <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                    <option value="user">User</option>
                    <option value="owner">Store Owner</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowUserForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showStoreForm && (
        <div className="modal-overlay" onClick={() => setShowStoreForm(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Store</h2>
            <form onSubmit={handleCreateStore}>
              <div className="form-grid">
                <div className="form-group field-wide">
                  <label>Store Name</label>
                  <input type="text" value={newStore.name} onChange={(e) => setNewStore({ ...newStore, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={newStore.email} onChange={(e) => setNewStore({ ...newStore, email: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input type="text" value={newStore.address} onChange={(e) => setNewStore({ ...newStore, address: e.target.value })} required maxLength={400} />
                </div>
                <div className="form-group field-wide">
                  <label>Assign owner (optional)</label>
                  <select value={newStore.ownerId} onChange={(e) => setNewStore({ ...newStore, ownerId: e.target.value })}>
                    <option value="">Leave unassigned</option>
                    {users.filter((userItem) => userItem.role === 'owner').map((ownerItem) => (
                      <option key={ownerItem.id} value={ownerItem.id}>{ownerItem.name} ({ownerItem.email})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowStoreForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Store</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

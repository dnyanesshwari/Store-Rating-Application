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
      setUsers(response.data);
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
      setStores(response.data);
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
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.name}</span>
          <button onClick={logoutUser} className="logout-btn">Logout</button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'active' : ''}>
          Dashboard
        </button>
        <button onClick={() => setActiveTab('users')} className={activeTab === 'users' ? 'active' : ''}>
          Users ({users.length})
        </button>
        <button onClick={() => setActiveTab('stores')} className={activeTab === 'stores' ? 'active' : ''}>
          Stores ({stores.length})
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'dashboard' && (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p className="stat-number">{stats.totalUsers}</p>
            </div>
            <div className="stat-card">
              <h3>Total Stores</h3>
              <p className="stat-number">{stats.totalStores}</p>
            </div>
            <div className="stat-card">
              <h3>Total Ratings</h3>
              <p className="stat-number">{stats.totalRatings}</p>
            </div>
            <div className="stat-card actions">
              <button onClick={() => setShowUserForm(true)} className="btn-primary">Add User</button>
              <button onClick={() => setShowStoreForm(true)} className="btn-primary">Add Store</button>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="table-section">
            <div className="filters">
              <input
                type="text"
                placeholder="Filter by name"
                value={userFilters.name}
                onChange={(e) => setUserFilters({ ...userFilters, name: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && fetchUsers()}
              />
              <input
                type="text"
                placeholder="Filter by email"
                value={userFilters.email}
                onChange={(e) => setUserFilters({ ...userFilters, email: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && fetchUsers()}
              />
              <input
                type="text"
                placeholder="Filter by address"
                value={userFilters.address}
                onChange={(e) => setUserFilters({ ...userFilters, address: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && fetchUsers()}
              />
              <select
                value={userFilters.role}
                onChange={(e) => setUserFilters({ ...userFilters, role: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && fetchUsers()}
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="owner">Owner</option>
              </select>
              <button onClick={fetchUsers} className="btn-secondary">Apply Filters</button>
              <button onClick={() => setShowUserForm(true)} className="btn-primary">Add User</button>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Role</th>
                  <th>Rating (if Owner)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.address || 'N/A'}</td>
                    <td><span className={`role-badge ${user.role}`}>{user.role}</span></td>
                    <td>{user.role === 'owner' ? (user.rating ? Number(user.rating).toFixed(1) : 'No ratings') : '-'}</td>
                    <td>
                      {user.role !== 'admin' && (
                        <button onClick={() => handleDeleteUser(user.id)} className="btn-danger">Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'stores' && (
          <div className="table-section">
            <div className="filters">
              <input
                type="text"
                placeholder="Filter by name"
                value={storeFilters.name}
                onChange={(e) => setStoreFilters({ ...storeFilters, name: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && fetchStores()}
              />
              <input
                type="text"
                placeholder="Filter by email"
                value={storeFilters.email}
                onChange={(e) => setStoreFilters({ ...storeFilters, email: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && fetchStores()}
              />
              <input
                type="text"
                placeholder="Filter by address"
                value={storeFilters.address}
                onChange={(e) => setStoreFilters({ ...storeFilters, address: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && fetchStores()}
              />
              <button onClick={fetchStores} className="btn-secondary">Apply Filters</button>
              <button onClick={() => setShowStoreForm(true)} className="btn-primary">Add Store</button>
            </div>

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
                    <td>
                      <button onClick={() => handleDeleteStore(store.id)} className="btn-danger">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* User Form Modal */}
      {showUserForm && (
        <div className="modal-overlay" onClick={() => setShowUserForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add New User</h2>
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label>Name (20-60 chars)</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  required
                  minLength={20}
                  maxLength={60}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password (8-16 chars, 1 uppercase, 1 special)</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                  minLength={8}
                  maxLength={16}
                />
              </div>
              <div className="form-group">
                <label>Address (max 400 chars)</label>
                <textarea
                  value={newUser.address}
                  onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                  maxLength={400}
                  rows="2"
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="user">User</option>
                  <option value="owner">Store Owner</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Create User</button>
                <button type="button" onClick={() => setShowUserForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Store Form Modal */}
      {showStoreForm && (
        <div className="modal-overlay" onClick={() => setShowStoreForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Store</h2>
            <form onSubmit={handleCreateStore}>
              <div className="form-group">
                <label>Store Name</label>
                <input
                  type="text"
                  value={newStore.name}
                  onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newStore.email}
                  onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={newStore.address}
                  onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
                  required
                  maxLength={400}
                />
              </div>
              <div className="form-group">
                <label>Assign owner (optional)</label>
                <select
                  value={newStore.ownerId}
                  onChange={(e) => setNewStore({ ...newStore, ownerId: e.target.value })}
                >
                  <option value="">Leave unassigned</option>
                  {users.filter((user) => user.role === 'owner').map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name} ({owner.email})
                    </option>
                  ))}
                </select>
                <small>Create an owner user first if no owner appears here.</small>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Create Store</button>
                <button type="button" onClick={() => setShowStoreForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

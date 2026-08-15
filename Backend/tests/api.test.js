const request = require('supertest');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

jest.mock('../config/db', () => {
  const bcrypt = require('bcryptjs');
  const users = [
    { id: 1, name: 'System Admin', email: 'admin@gmail.com', password_hash: bcrypt.hashSync('Password!123', 10), role: 'admin', address: '123 Admin Street' },
    { id: 2, name: 'Demo User', email: 'user@example.com', password_hash: bcrypt.hashSync('Password!123', 10), role: 'user', address: '123 Demo Street' },
    { id: 3, name: 'Demo Owner', email: 'owner@example.com', password_hash: bcrypt.hashSync('Password!123', 10), role: 'owner', address: '123 Owner Street' },
  ];

  const stores = [
    { id: 1, name: 'Sample Store', email: 'store@example.com', address: 'Main Street', owner_id: 3 },
  ];

  const ratings = [
    { id: 1, user_id: 2, store_id: 1, rating: 5, created_at: '2024-01-01T00:00:00.000Z' },
  ];

  const buildRows = (rows) => ({ rows, rowCount: rows.length, insertId: rows[0]?.id || null });

  return {
    query: jest.fn(async (sql, values = []) => {
      const text = String(sql).trim();

      if (text.startsWith('SELECT id, name, email, password_hash, role, address FROM users WHERE email = ?')) {
        const email = values[0];
        const row = users.find((u) => u.email === email);
        return buildRows(row ? [row] : []);
      }

      if (text.startsWith('SELECT id, name, email, role, address FROM users WHERE id = ?')) {
        const id = Number(values[0]);
        const row = users.find((u) => u.id === id);
        return buildRows(row ? [row] : []);
      }

      if (text.startsWith('INSERT INTO users')) {
        const [name, email, password_hash, address, role] = values;
        const newUser = { id: users.length + 1, name, email, password_hash, address, role };
        users.push(newUser);
        return { rows: [], rowCount: 1, insertId: newUser.id };
      }

      if (text.startsWith('SELECT COUNT(*) AS count FROM users')) {
        return buildRows([{ count: users.length }]);
      }

      if (text.startsWith('SELECT COUNT(*) AS count FROM stores')) {
        return buildRows([{ count: stores.length }]);
      }

      if (text.startsWith('SELECT COUNT(*) AS count FROM ratings')) {
        return buildRows([{ count: ratings.length }]);
      }

      if (text.startsWith('SELECT id FROM users WHERE email = ?')) {
        const email = values[0];
        const row = users.find((u) => u.email === email);
        return buildRows(row ? [{ id: row.id }] : []);
      }

      if (text.startsWith('SELECT id FROM stores WHERE id = ?')) {
        const id = Number(values[0]);
        const row = stores.find((s) => s.id === id);
        return buildRows(row ? [{ id: row.id }] : []);
      }

      if (text.startsWith('SELECT id FROM ratings WHERE user_id = ? AND store_id = ?')) {
        const [userId, storeId] = values;
        const row = ratings.find((r) => r.user_id === Number(userId) && r.store_id === Number(storeId));
        return buildRows(row ? [{ id: row.id }] : []);
      }

      if (text.startsWith('INSERT INTO ratings')) {
        const [userId, storeId, rating] = values;
        const newRating = { id: ratings.length + 1, user_id: Number(userId), store_id: Number(storeId), rating: Number(rating), created_at: new Date().toISOString() };
        ratings.push(newRating);
        return { rows: [], rowCount: 1, insertId: newRating.id };
      }

      if (text.startsWith('SELECT rating FROM ratings WHERE user_id = ? AND store_id = ?')) {
        const [userId, storeId] = values;
        const row = ratings.find((r) => r.user_id === Number(userId) && r.store_id === Number(storeId));
        return buildRows(row ? [{ rating: row.rating }] : []);
      }

      if (text.startsWith('SELECT s.id, s.name, s.address, s.email')) {
        return buildRows(stores.map((store) => ({
          ...store,
          overall_rating: 5,
          total_ratings: ratings.filter((r) => r.store_id === store.id).length,
          user_rating: ratings.find((r) => r.store_id === store.id && r.user_id === Number(values[0]))?.rating || null,
        })));
      }

      if (text.startsWith('SELECT u.id, u.name, u.email, u.address, u.role')) {
        return buildRows(users.map((u) => ({ ...u, rating: 5 })));
      }

      if (text.startsWith('SELECT s.id, s.name, s.email, s.address, s.owner_id')) {
        return buildRows(stores.map((store) => ({ ...store, owner_name: 'Demo Owner', average_rating: 5, total_ratings: 1 })));
      }

      if (text.startsWith('SELECT role FROM users WHERE id = ?')) {
        const id = Number(values[0]);
        const row = users.find((u) => u.id === id);
        return buildRows(row ? [{ role: row.role }] : []);
      }

      if (text.startsWith('SELECT * FROM stores WHERE owner_id = ?')) {
        const ownerId = Number(values[0]);
        return buildRows(stores.filter((s) => s.owner_id === ownerId).map((s) => ({ ...s })));
      }

      if (text.startsWith('SELECT r.id, r.rating, r.created_at, u.name as user_name')) {
        return buildRows(ratings.map((r) => ({
          id: r.id,
          rating: r.rating,
          created_at: r.created_at,
          user_name: 'Demo User',
          user_email: 'user@example.com',
          store_name: 'Sample Store',
        })));
      }

      if (text.startsWith('SELECT COALESCE(AVG(rating), 0) AS average_rating')) {
        return buildRows([{ average_rating: 5, total_ratings: ratings.length }]);
      }

      if (text.startsWith('UPDATE users SET password_hash = ?')) {
        const user = users.find((u) => u.id === Number(values[1]));
        if (user) user.password_hash = values[0];
        return { rows: [], rowCount: 1, affectedRows: 1 };
      }

      if (text.startsWith('UPDATE ratings')) {
        const [rating, userId, storeId] = values;
        const item = ratings.find((r) => r.user_id === Number(userId) && r.store_id === Number(storeId));
        if (item) item.rating = Number(rating);
        return { rows: [], rowCount: 1, affectedRows: 1 };
      }

      return { rows: [], rowCount: 0, insertId: null };
    }),
    end: jest.fn(),
  };
});

const { app } = require('../server');

describe('Store Rating API', () => {
  test('registers a user and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Doe Smith Example Name',
        email: 'newuser@example.com',
        password: 'Password!123',
        address: '123 Main Street',
      });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe('newuser@example.com');
  });

  test('rejects admin access without a valid role', async () => {
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'Password!123' });

    expect(login.status).toBe(200);

    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${login.body.token}`);

    expect(res.status).toBe(403);
  });

  test('searches stores with a query', async () => {
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'Password!123' });

    const res = await request(app)
      .get('/api/stores/search')
      .query({ query: 'Sample' })
      .set('Authorization', `Bearer ${login.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toBeDefined();
    expect(Array.isArray(res.body.items)).toBe(true);
  });
});

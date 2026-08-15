const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { authenticate, checkRole } = require('../middleware/auth');
const { validateUserCreate, validateStore, validateSearch } = require('../validators');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate, checkRole('admin'));

// Dashboard Stats
router.get('/stats', async (req, res) => {
    try {
        const [usersResult, storesResult, ratingsResult] = await Promise.all([
            pool.query('SELECT COUNT(*) AS count FROM users'),
            pool.query('SELECT COUNT(*) AS count FROM stores'),
            pool.query('SELECT COUNT(*) AS count FROM ratings')
        ]);

        res.json({
            totalUsers: parseInt(usersResult.rows[0].count),
            totalStores: parseInt(storesResult.rows[0].count),
            totalRatings: parseInt(ratingsResult.rows[0].count)
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Create User (Admin, User, or Owner)
router.post('/users', async (req, res) => {
    try {
        const { error } = validateUserCreate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { name, email, password, address, role } = req.body;

        // Check if user exists
        const existing = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash, address, role) 
             VALUES (?, ?, ?, ?, ?)`,
            [name, email, hashedPassword, address, role]
        );

        const userResult = await pool.query(
            'SELECT id, name, email, role, address FROM users WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json(userResult.rows[0]);
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Get Users with Filters
router.get('/users', async (req, res) => {
    try {
        const { error } = validateSearch(req.query);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { name, email, address, role, sortField = 'name', sortDirection = 'asc', page = 1, limit = 10 } = req.query;
        const safeSortField = ['name', 'email', 'address', 'role', 'created_at'].includes(sortField) ? sortField : 'name';
        const safeSortDirection = ['asc', 'desc'].includes(String(sortDirection).toLowerCase()) ? String(sortDirection).toLowerCase() : 'asc';
        const pageNumber = Math.max(1, Number(page));
        const pageSize = Math.min(100, Math.max(1, Number(limit)));
        const offset = (pageNumber - 1) * pageSize;

        let query = `
            SELECT u.id, u.name, u.email, u.address, u.role,
                   COALESCE(AVG(r.rating), 0) as rating
            FROM users u
            LEFT JOIN stores s ON s.owner_id = u.id
            LEFT JOIN ratings r ON r.store_id = s.id
            WHERE 1=1
        `;
        const values = [];

        if (name) {
            query += ` AND u.name LIKE ?`;
            values.push(`%${name}%`);
        }
        if (email) {
            query += ` AND u.email LIKE ?`;
            values.push(`%${email}%`);
        }
        if (address) {
            query += ` AND u.address LIKE ?`;
            values.push(`%${address}%`);
        }
        if (role) {
            query += ` AND u.role = ?`;
            values.push(role);
        }

        const countQuery = `SELECT COUNT(*) AS total FROM users u WHERE 1=1`;
        const countValues = [];

        if (name) {
            countQuery += ` AND u.name LIKE ?`;
            countValues.push(`%${name}%`);
        }
        if (email) {
            countQuery += ` AND u.email LIKE ?`;
            countValues.push(`%${email}%`);
        }
        if (address) {
            countQuery += ` AND u.address LIKE ?`;
            countValues.push(`%${address}%`);
        }
        if (role) {
            countQuery += ` AND u.role = ?`;
            countValues.push(role);
        }

        const countResult = await pool.query(countQuery, countValues);
        const total = Number(countResult.rows[0]?.total || 0);

        query += ` GROUP BY u.id ORDER BY ${safeSortField} ${safeSortDirection} LIMIT ? OFFSET ?`;
        values.push(pageSize, offset);

        const result = await pool.query(query, values);
        res.json({
            items: result.rows,
            page: pageNumber,
            limit: pageSize,
            total,
            totalPages: Math.max(1, Math.ceil(total / pageSize)),
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Create Store
router.post('/stores', async (req, res) => {
    try {
        const { error } = validateStore(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { name, email, address, ownerId } = req.body;

        // Check if store exists
        const existing = await pool.query('SELECT id FROM stores WHERE email = ?', [email]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Store with this email already exists' });
        }

        const result = await pool.query(
            `INSERT INTO stores (name, email, address, owner_id) 
             VALUES (?, ?, ?, ?)`,
            [name, email, address, ownerId || null]
        );

        const storeResult = await pool.query(
            'SELECT id, name, email, address, owner_id FROM stores WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json(storeResult.rows[0]);
    } catch (error) {
        console.error('Create store error:', error);
        res.status(500).json({ error: 'Failed to create store' });
    }
});

// Get Stores with Filters
router.get('/stores', async (req, res) => {
    try {
        const { error } = validateSearch(req.query);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { name, email, address, sortField = 'name', sortDirection = 'asc', page = 1, limit = 10 } = req.query;
        const safeSortField = ['name', 'email', 'address', 'owner_id', 'created_at'].includes(sortField) ? sortField : 'name';
        const safeSortDirection = ['asc', 'desc'].includes(String(sortDirection).toLowerCase()) ? String(sortDirection).toLowerCase() : 'asc';
        const pageNumber = Math.max(1, Number(page));
        const pageSize = Math.min(100, Math.max(1, Number(limit)));
        const offset = (pageNumber - 1) * pageSize;

        let query = `
            SELECT s.id, s.name, s.email, s.address, s.owner_id,
                   u.name as owner_name,
                   COALESCE(AVG(r.rating), 0) as average_rating,
                   COUNT(r.id) as total_ratings
            FROM stores s
            LEFT JOIN users u ON u.id = s.owner_id
            LEFT JOIN ratings r ON r.store_id = s.id
            WHERE 1=1
        `;
        const values = [];

        if (name) {
            query += ` AND s.name LIKE ?`;
            values.push(`%${name}%`);
        }
        if (email) {
            query += ` AND s.email LIKE ?`;
            values.push(`%${email}%`);
        }
        if (address) {
            query += ` AND s.address LIKE ?`;
            values.push(`%${address}%`);
        }

        const countQuery = `SELECT COUNT(*) AS total FROM stores s WHERE 1=1`;
        const countValues = [];

        if (name) {
            countQuery += ` AND s.name LIKE ?`;
            countValues.push(`%${name}%`);
        }
        if (email) {
            countQuery += ` AND s.email LIKE ?`;
            countValues.push(`%${email}%`);
        }
        if (address) {
            countQuery += ` AND s.address LIKE ?`;
            countValues.push(`%${address}%`);
        }

        const countResult = await pool.query(countQuery, countValues);
        const total = Number(countResult.rows[0]?.total || 0);

        query += ` GROUP BY s.id, u.name ORDER BY ${safeSortField} ${safeSortDirection} LIMIT ? OFFSET ?`;
        values.push(pageSize, offset);

        const result = await pool.query(query, values);
        res.json({
            items: result.rows,
            page: pageNumber,
            limit: pageSize,
            total,
            totalPages: Math.max(1, Math.ceil(total / pageSize)),
        });
    } catch (error) {
        console.error('Get stores error:', error);
        res.status(500).json({ error: 'Failed to fetch stores' });
    }
});

// Delete User
router.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Don't allow deleting admin
        const userCheck = await pool.query('SELECT role FROM users WHERE id = ?', [id]);
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (userCheck.rows[0].role === 'admin') {
            return res.status(403).json({ error: 'Cannot delete admin user' });
        }

        await pool.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Delete Store
router.delete('/stores/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM stores WHERE id = ?', [id]);
        res.json({ message: 'Store deleted successfully' });
    } catch (error) {
        console.error('Delete store error:', error);
        res.status(500).json({ error: 'Failed to delete store' });
    }
});

// Update Store Owner
router.put('/stores/:id/owner', async (req, res) => {
    try {
        const { id } = req.params;
        const { ownerId } = req.body;

        // Verify owner exists and is actually an owner
        if (ownerId) {
            const ownerCheck = await pool.query(
                'SELECT role FROM users WHERE id = ? AND role = ?',
                [ownerId, 'owner']
            );
            if (ownerCheck.rows.length === 0) {
                return res.status(400).json({ error: 'Invalid owner. User must have owner role.' });
            }
        }

        await pool.query(
            'UPDATE stores SET owner_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [ownerId || null, id]
        );

        res.json({ message: 'Store owner updated successfully' });
    } catch (error) {
        console.error('Update store owner error:', error);
        res.status(500).json({ error: 'Failed to update store owner' });
    }
});

module.exports = router;

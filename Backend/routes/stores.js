const express = require('express');
const pool = require('../config/db');
const { authenticate, checkRole } = require('../middleware/auth');
const { validateRating, validateSearch } = require('../validators');

const router = express.Router();

// All store routes require authentication
router.use(authenticate);

// Get all stores with user's rating
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const page = Math.max(1, Number(req.query.page || 1));
        const limit = Math.min(100, Math.max(1, Number(req.query.limit || 10)));
        const offset = (page - 1) * limit;
        const sortBy = ['name', 'address', 'created_at'].includes(req.query.sortBy) ? req.query.sortBy : 'name';
        const sortDirection = ['asc', 'desc'].includes(String(req.query.sortDirection || 'asc').toLowerCase()) ? String(req.query.sortDirection).toLowerCase() : 'asc';
        const searchTerm = req.query.search || req.query.query || '';

        let sqlQuery = `
            SELECT s.id, s.name, s.address, s.email,
                   COALESCE(AVG(r.rating), 0) as overall_rating,
                   COUNT(r.id) as total_ratings,
                   MAX(CASE WHEN u_r.user_id = ? THEN u_r.rating ELSE NULL END) as user_rating
            FROM stores s
            LEFT JOIN ratings r ON r.store_id = s.id
            LEFT JOIN ratings u_r ON u_r.store_id = s.id
            WHERE 1=1
        `;
        const values = [userId];

        if (searchTerm) {
            sqlQuery += ` AND (s.name LIKE ? OR s.address LIKE ? OR s.email LIKE ?)`;
            values.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
        }

        sqlQuery += ` GROUP BY s.id ORDER BY ${sortBy} ${sortDirection} LIMIT ? OFFSET ?`;
        values.push(limit, offset);

        const result = await pool.query(sqlQuery, values);
        const totalResult = await pool.query(`SELECT COUNT(*) AS total FROM stores WHERE 1=1 ${searchTerm ? 'AND (name LIKE ? OR address LIKE ? OR email LIKE ?)' : ''}`, searchTerm ? [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`] : []);

        res.json({
            items: result.rows,
            page,
            limit,
            total: Number(totalResult.rows[0]?.total || 0),
            totalPages: Math.max(1, Math.ceil((Number(totalResult.rows[0]?.total || 0)) / limit)),
        });
    } catch (error) {
        console.error('Get stores error:', error);
        res.status(500).json({ error: 'Failed to fetch stores' });
    }
});

// Search stores by name and address
router.get('/search', async (req, res) => {
    try {
        const { error } = validateSearch(req.query);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { query, page = 1, limit = 10, sortField = 'name', sortDirection = 'asc' } = req.query;
        const userId = req.user.id;
        const pageNumber = Math.max(1, Number(page));
        const pageSize = Math.min(100, Math.max(1, Number(limit)));
        const offset = (pageNumber - 1) * pageSize;
        const safeSortField = ['name', 'address', 'email', 'created_at'].includes(sortField) ? sortField : 'name';
        const safeSortDirection = ['asc', 'desc'].includes(String(sortDirection).toLowerCase()) ? String(sortDirection).toLowerCase() : 'asc';

        let sqlQuery = `
            SELECT s.id, s.name, s.address, s.email,
                   COALESCE(AVG(r.rating), 0) as overall_rating,
                   COUNT(r.id) as total_ratings,
                   MAX(CASE WHEN u_r.user_id = ? THEN u_r.rating ELSE NULL END) as user_rating
            FROM stores s
            LEFT JOIN ratings r ON r.store_id = s.id
            LEFT JOIN ratings u_r ON u_r.store_id = s.id
            WHERE 1=1
        `;
        const values = [userId];

        if (query) {
            sqlQuery += ` AND (s.name LIKE ? OR s.address LIKE ? OR s.email LIKE ?)`;
            values.push(`%${query}%`, `%${query}%`, `%${query}%`);
        }

        const countQuery = `SELECT COUNT(*) AS total FROM stores s WHERE 1=1 ${query ? 'AND (s.name LIKE ? OR s.address LIKE ? OR s.email LIKE ?)' : ''}`;
        const countValues = query ? [`%${query}%`, `%${query}%`, `%${query}%`] : [];
        const countResult = await pool.query(countQuery, countValues);
        const total = Number(countResult.rows[0]?.total || 0);

        sqlQuery += ` GROUP BY s.id ORDER BY ${safeSortField} ${safeSortDirection} LIMIT ? OFFSET ?`;
        values.push(pageSize, offset);

        const result = await pool.query(sqlQuery, values);
        res.json({
            items: result.rows,
            page: pageNumber,
            limit: pageSize,
            total,
            totalPages: Math.max(1, Math.ceil(total / pageSize)),
        });
    } catch (error) {
        console.error('Search stores error:', error);
        res.status(500).json({ error: 'Failed to search stores' });
    }
});

// Submit or update rating
router.post('/ratings', async (req, res) => {
    try {
        const { error } = validateRating(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { storeId, rating } = req.body;
        const userId = req.user.id;

        // Check if user is allowed to rate (only users, not owners or admins)
        if (req.user.role !== 'user') {
            return res.status(403).json({ error: 'Only standard users can rate stores' });
        }

        // Check if store exists
        const storeCheck = await pool.query('SELECT id FROM stores WHERE id = ?', [storeId]);
        if (storeCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Store not found' });
        }

        // Check if rating exists
        const existing = await pool.query(
            'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
            [userId, storeId]
        );

        let result;
        if (existing.rows.length > 0) {
            await pool.query(
                `UPDATE ratings 
                 SET rating = ?, updated_at = CURRENT_TIMESTAMP 
                 WHERE user_id = ? AND store_id = ?`,
                [rating, userId, storeId]
            );

            const updatedResult = await pool.query(
                'SELECT id, rating, created_at, updated_at FROM ratings WHERE user_id = ? AND store_id = ?',
                [userId, storeId]
            );
            result = updatedResult.rows[0];
        } else {
            const insertResult = await pool.query(
                `INSERT INTO ratings (user_id, store_id, rating) 
                 VALUES (?, ?, ?)`,
                [userId, storeId, rating]
            );

            const newResult = await pool.query(
                'SELECT id, rating, created_at, updated_at FROM ratings WHERE id = ?',
                [insertResult.insertId]
            );
            result = newResult.rows[0];
        }

        res.status(201).json({
            message: 'Rating submitted successfully',
            rating: result
        });
    } catch (error) {
        console.error('Submit rating error:', error);
        res.status(500).json({ error: 'Failed to submit rating' });
    }
});

// Get user's rating for a specific store
router.get('/ratings/:storeId', async (req, res) => {
    try {
        const { storeId } = req.params;
        const userId = req.user.id;

        const result = await pool.query(
            'SELECT rating FROM ratings WHERE user_id = ? AND store_id = ?',
            [userId, storeId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No rating found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get rating error:', error);
        res.status(500).json({ error: 'Failed to fetch rating' });
    }
});

module.exports = router;
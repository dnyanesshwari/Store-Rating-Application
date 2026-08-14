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

        const result = await pool.query(
            `SELECT s.id, s.name, s.address, s.email,
                    COALESCE(AVG(r.rating), 0) as overall_rating,
                    COUNT(r.id) as total_ratings,
                    u_r.rating as user_rating
             FROM stores s
             LEFT JOIN ratings r ON r.store_id = s.id
             LEFT JOIN ratings u_r ON u_r.store_id = s.id AND u_r.user_id = $1
             GROUP BY s.id, u_r.rating
             ORDER BY s.name ASC`,
            [userId]
        );

        res.json(result.rows);
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

        const { query } = req.query;
        const userId = req.user.id;

        let sqlQuery = `
            SELECT s.id, s.name, s.address, s.email,
                   COALESCE(AVG(r.rating), 0) as overall_rating,
                   COUNT(r.id) as total_ratings,
                   u_r.rating as user_rating
            FROM stores s
            LEFT JOIN ratings r ON r.store_id = s.id
            LEFT JOIN ratings u_r ON u_r.store_id = s.id AND u_r.user_id = $1
            WHERE 1=1
        `;
        const values = [userId];
        let paramCount = 2;

        if (query) {
            sqlQuery += ` AND (s.name ILIKE $${paramCount} OR s.address ILIKE $${paramCount})`;
            values.push(`%${query}%`);
            paramCount++;
        }

        sqlQuery += ` GROUP BY s.id, u_r.rating ORDER BY s.name ASC`;

        const result = await pool.query(sqlQuery, values);
        res.json(result.rows);
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
        const storeCheck = await pool.query('SELECT id FROM stores WHERE id = $1', [storeId]);
        if (storeCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Store not found' });
        }

        // Check if rating exists
        const existing = await pool.query(
            'SELECT id FROM ratings WHERE user_id = $1 AND store_id = $2',
            [userId, storeId]
        );

        let result;
        if (existing.rows.length > 0) {
            // Update existing rating
            result = await pool.query(
                `UPDATE ratings 
                 SET rating = $1, updated_at = CURRENT_TIMESTAMP 
                 WHERE user_id = $2 AND store_id = $3 
                 RETURNING id, rating, created_at, updated_at`,
                [rating, userId, storeId]
            );
        } else {
            // Create new rating
            result = await pool.query(
                `INSERT INTO ratings (user_id, store_id, rating) 
                 VALUES ($1, $2, $3) 
                 RETURNING id, rating, created_at, updated_at`,
                [userId, storeId, rating]
            );
        }

        res.status(201).json({
            message: 'Rating submitted successfully',
            rating: result.rows[0]
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
            'SELECT rating FROM ratings WHERE user_id = $1 AND store_id = $2',
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
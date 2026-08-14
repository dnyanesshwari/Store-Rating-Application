const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { validateSignup, validateLogin, validatePasswordUpdate } = require('../validators');

const router = express.Router();

// User Registration
router.post('/register', async (req, res) => {
    try {
        const { error } = validateSignup(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { name, email, password, address } = req.body;

        // Check existing user
        const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user (role 'user' by default)
        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash, address, role) 
             VALUES ($1, $2, $3, $4, 'user') 
             RETURNING id, name, email, role, address`,
            [name, email, hashedPassword, address]
        );

        const user = result.rows[0];

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                address: user.address
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// User Login
router.post('/login', async (req, res) => {
    try {
        const { error } = validateLogin(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { email, password } = req.body;

        const result = await pool.query(
            'SELECT id, name, email, password_hash, role, address FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];
        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                address: user.address
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Update Password
router.put('/update-password', authenticate, async (req, res) => {
    try {
        const { error } = validatePasswordUpdate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        // Verify current password
        const result = await pool.query(
            'SELECT password_hash FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isValid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Update password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query(
            'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [hashedPassword, userId]
        );

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Password update error:', error);
        res.status(500).json({ error: 'Password update failed' });
    }
});

module.exports = router;
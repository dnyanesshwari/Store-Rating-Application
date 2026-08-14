const express = require('express');
const pool = require('../config/db');
const { authenticate, checkRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, checkRole('owner'));

router.get('/dashboard', async (req, res) => {
  try {
    const ownerId = req.user.id;

    const storeResult = await pool.query(
      'SELECT id, name, email, address FROM stores WHERE owner_id = $1 ORDER BY name ASC',
      [ownerId]
    );

    if (storeResult.rows.length === 0) {
      return res.json({ stores: [], ratings: [], averageRating: 0, totalRatings: 0 });
    }

    const stores = storeResult.rows;
    const storeIds = stores.map((store) => store.id);

    const ratingsResult = await pool.query(
      `SELECT r.id, r.rating, r.created_at, u.name as user_name, u.email as user_email, s.name as store_name
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       JOIN stores s ON r.store_id = s.id
       WHERE r.store_id IN ($1)
       ORDER BY r.created_at DESC`,
      [storeIds]
    );

    const avgResult = await pool.query(
      `SELECT COALESCE(AVG(rating), 0) AS average_rating, COUNT(*) AS total_ratings
       FROM ratings WHERE store_id IN ($1)`,
      [storeIds]
    );

    const payload = {
      stores,
      ratings: ratingsResult.rows,
      averageRating: Number(avgResult.rows[0].average_rating || 0),
      totalRatings: Number(avgResult.rows[0].total_ratings || 0),
    };

    res.json(payload);
  } catch (err) {
    console.error('Owner dashboard error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

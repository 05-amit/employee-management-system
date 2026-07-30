const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/performance?employee_id= -- list performance reviews
router.get('/', authenticate, async (req, res) => {
  try {
    const { employee_id } = req.query;
    let query = `
      SELECT r.*, e.full_name, e.employee_code
      FROM performance_reviews r
      JOIN employees e ON r.employee_id = e.id
      WHERE 1=1`;
    const params = [];

    if (employee_id) { query += ' AND r.employee_id = ?'; params.push(employee_id); }
    query += ' ORDER BY r.created_at DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching performance reviews' });
  }
});

// POST /api/performance -- add a performance review (admin/hr only)
router.post('/', authenticate, authorize('admin', 'hr'), async (req, res) => {
  try {
    const { employee_id, review_period, rating, comments, reviewed_by } = req.body;
    if (!employee_id || !review_period || !rating) {
      return res.status(400).json({ message: 'employee_id, review_period and rating are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO performance_reviews (employee_id, review_period, rating, comments, reviewed_by)
       VALUES (?, ?, ?, ?, ?)`,
      [employee_id, review_period, rating, comments, reviewed_by]
    );

    res.status(201).json({ message: 'Performance review added', reviewId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error adding performance review' });
  }
});

module.exports = router;

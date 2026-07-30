const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/leave?employee_id=&status= -- list leave requests
router.get('/', authenticate, async (req, res) => {
  try {
    const { employee_id, status } = req.query;
    let query = `
      SELECT l.*, e.full_name, e.employee_code
      FROM leave_requests l
      JOIN employees e ON l.employee_id = e.id
      WHERE 1=1`;
    const params = [];

    if (employee_id) { query += ' AND l.employee_id = ?'; params.push(employee_id); }
    if (status) { query += ' AND l.status = ?'; params.push(status); }

    query += ' ORDER BY l.applied_at DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching leave requests' });
  }
});

// POST /api/leave -- apply for leave
router.post('/', authenticate, async (req, res) => {
  try {
    const { employee_id, leave_type, start_date, end_date, reason } = req.body;
    if (!employee_id || !start_date || !end_date) {
      return res.status(400).json({ message: 'employee_id, start_date and end_date are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason)
       VALUES (?, ?, ?, ?, ?)`,
      [employee_id, leave_type || 'casual', start_date, end_date, reason]
    );

    res.status(201).json({ message: 'Leave request submitted', leaveId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error submitting leave request' });
  }
});

// PUT /api/leave/:id/status -- approve or reject a leave request (admin/hr only)
router.put('/:id/status', authenticate, authorize('admin', 'hr'), async (req, res) => {
  try {
    const { status } = req.body; // 'approved' | 'rejected'
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const [result] = await pool.query(
      'UPDATE leave_requests SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: 'Leave request not found' });
    res.json({ message: `Leave request ${status}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating leave status' });
  }
});

module.exports = router;

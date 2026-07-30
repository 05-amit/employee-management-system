const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/attendance?employee_id=&date=&month=&year= -- list attendance records
router.get('/', authenticate, async (req, res) => {
  try {
    const { employee_id, date, month, year } = req.query;
    let query = `
      SELECT a.*, e.full_name, e.employee_code
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      WHERE 1=1`;
    const params = [];

    if (employee_id) { query += ' AND a.employee_id = ?'; params.push(employee_id); }
    if (date) { query += ' AND a.date = ?'; params.push(date); }
    if (month) { query += ' AND MONTH(a.date) = ?'; params.push(month); }
    if (year) { query += ' AND YEAR(a.date) = ?'; params.push(year); }

    query += ' ORDER BY a.date DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching attendance' });
  }
});

// POST /api/attendance/check-in -- mark check-in for today
router.post('/check-in', authenticate, async (req, res) => {
  try {
    const { employee_id } = req.body;
    const today = new Date().toISOString().slice(0, 10);
    const now = new Date().toTimeString().slice(0, 8);

    await pool.query(
      `INSERT INTO attendance (employee_id, date, check_in, status)
       VALUES (?, ?, ?, 'present')
       ON DUPLICATE KEY UPDATE check_in = VALUES(check_in), status = 'present'`,
      [employee_id, today, now]
    );

    res.json({ message: 'Checked in successfully', time: now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during check-in' });
  }
});

// POST /api/attendance/check-out -- mark check-out for today
router.post('/check-out', authenticate, async (req, res) => {
  try {
    const { employee_id } = req.body;
    const today = new Date().toISOString().slice(0, 10);
    const now = new Date().toTimeString().slice(0, 8);

    const [result] = await pool.query(
      `UPDATE attendance SET check_out = ? WHERE employee_id = ? AND date = ?`,
      [now, employee_id, today]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No check-in record found for today' });
    }
    res.json({ message: 'Checked out successfully', time: now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during check-out' });
  }
});

// POST /api/attendance -- manually add/update an attendance record (admin/hr)
router.post('/', authenticate, authorize('admin', 'hr'), async (req, res) => {
  try {
    const { employee_id, date, check_in, check_out, status } = req.body;
    await pool.query(
      `INSERT INTO attendance (employee_id, date, check_in, check_out, status)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE check_in = VALUES(check_in), check_out = VALUES(check_out), status = VALUES(status)`,
      [employee_id, date, check_in, check_out, status || 'present']
    );
    res.status(201).json({ message: 'Attendance record saved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error saving attendance' });
  }
});

module.exports = router;

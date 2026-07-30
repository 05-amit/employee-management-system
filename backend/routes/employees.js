const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/employees -- list all employees (with optional search & department filter)
router.get('/', authenticate, async (req, res) => {
  try {
    const { search, department } = req.query;
    let query = 'SELECT * FROM employees WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (full_name LIKE ? OR employee_code LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (department) {
      query += ' AND department = ?';
      params.push(department);
    }
    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching employees' });
  }
});

// GET /api/employees/:id -- get single employee
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Employee not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching employee' });
  }
});

// POST /api/employees -- create a new employee record (admin/hr only)
router.post('/', authenticate, authorize('admin', 'hr'), async (req, res) => {
  try {
    const {
      employee_code, full_name, email, phone,
      department, designation, date_of_joining, salary
    } = req.body;

    if (!employee_code || !full_name || !email) {
      return res.status(400).json({ message: 'employee_code, full_name and email are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO employees
       (employee_code, full_name, email, phone, department, designation, date_of_joining, salary)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [employee_code, full_name, email, phone, department, designation, date_of_joining, salary || 0]
    );

    res.status(201).json({ message: 'Employee created successfully', employeeId: result.insertId });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Employee code or email already exists' });
    }
    res.status(500).json({ message: 'Server error creating employee' });
  }
});

// PUT /api/employees/:id -- update employee record (admin/hr only)
router.put('/:id', authenticate, authorize('admin', 'hr'), async (req, res) => {
  try {
    const {
      full_name, email, phone, department,
      designation, date_of_joining, salary, status
    } = req.body;

    const [result] = await pool.query(
      `UPDATE employees SET
        full_name = ?, email = ?, phone = ?, department = ?,
        designation = ?, date_of_joining = ?, salary = ?, status = ?
       WHERE id = ?`,
      [full_name, email, phone, department, designation, date_of_joining, salary, status, req.params.id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: 'Employee not found' });
    res.json({ message: 'Employee updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating employee' });
  }
});

// DELETE /api/employees/:id -- remove employee (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM employees WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Employee not found' });
    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting employee' });
  }
});

module.exports = router;

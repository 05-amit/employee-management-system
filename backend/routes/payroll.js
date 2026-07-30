const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/payroll?employee_id=&month=&year= -- list payroll records
router.get('/', authenticate, async (req, res) => {
  try {
    const { employee_id, month, year } = req.query;
    let query = `
      SELECT p.*, e.full_name, e.employee_code
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      WHERE 1=1`;
    const params = [];

    if (employee_id) { query += ' AND p.employee_id = ?'; params.push(employee_id); }
    if (month) { query += ' AND p.month = ?'; params.push(month); }
    if (year) { query += ' AND p.year = ?'; params.push(year); }

    query += ' ORDER BY p.year DESC, p.month DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching payroll' });
  }
});

// POST /api/payroll/generate -- generate a payslip for an employee for a given month/year (admin/hr)
router.post('/generate', authenticate, authorize('admin', 'hr'), async (req, res) => {
  try {
    const { employee_id, month, year, allowances, deductions } = req.body;
    if (!employee_id || !month || !year) {
      return res.status(400).json({ message: 'employee_id, month and year are required' });
    }

    const [empRows] = await pool.query('SELECT salary FROM employees WHERE id = ?', [employee_id]);
    if (empRows.length === 0) return res.status(404).json({ message: 'Employee not found' });

    const basicSalary = parseFloat(empRows[0].salary) || 0;
    const allow = parseFloat(allowances) || 0;
    const deduct = parseFloat(deductions) || 0;
    const netSalary = basicSalary + allow - deduct;

    await pool.query(
      `INSERT INTO payroll (employee_id, month, year, basic_salary, allowances, deductions, net_salary)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         basic_salary = VALUES(basic_salary),
         allowances = VALUES(allowances),
         deductions = VALUES(deductions),
         net_salary = VALUES(net_salary)`,
      [employee_id, month, year, basicSalary, allow, deduct, netSalary]
    );

    res.status(201).json({ message: 'Payslip generated successfully', netSalary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error generating payroll' });
  }
});

module.exports = router;

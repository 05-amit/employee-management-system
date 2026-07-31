
const bcrypt = require('bcryptjs');
const pool = require('./config/db');

const today = new Date().toISOString().slice(0, 10);

const employees = [
  { code: 'EMP001', name: 'Aarav Sharma',  email: 'aarav.sharma@company.com',  phone: '9876500001', department: 'Engineering', designation: 'Software Engineer',     doj: '2023-01-15', salary: 65000 },
  { code: 'EMP002', name: 'Priya Nair',    email: 'priya.nair@company.com',    phone: '9876500002', department: 'Engineering', designation: 'Senior Software Engineer', doj: '2021-06-01', salary: 95000 },
  { code: 'EMP003', name: 'Rohan Mehta',   email: 'rohan.mehta@company.com',   phone: '9876500003', department: 'Human Resources', designation: 'HR Manager',       doj: '2020-03-10', salary: 78000 },
  { code: 'EMP004', name: 'Sneha Kapoor',  email: 'sneha.kapoor@company.com',  phone: '9876500004', department: 'Sales',       designation: 'Sales Executive',    doj: '2022-09-05', salary: 52000 },
  { code: 'EMP005', name: 'Vikram Singh',  email: 'vikram.singh@company.com',  phone: '9876500005', department: 'Sales',       designation: 'Sales Manager',      doj: '2019-11-20', salary: 88000 },
  { code: 'EMP006', name: 'Anjali Verma',  email: 'anjali.verma@company.com',  phone: '9876500006', department: 'Marketing',   designation: 'Marketing Specialist', doj: '2023-04-18', salary: 58000 },
  { code: 'EMP007', name: 'Karan Patel',   email: 'karan.patel@company.com',   phone: '9876500007', department: 'Finance',     designation: 'Accountant',         doj: '2022-02-14', salary: 60000 },
  { code: 'EMP008', name: 'Neha Joshi',    email: 'neha.joshi@company.com',    phone: '9876500008', department: 'Engineering', designation: 'QA Engineer',        doj: '2023-07-01', salary: 62000, status: 'inactive' },
];

// [status, hasCheckedOut]
const attendanceStatus = ['present', 'present', 'present', 'present', 'present', 'half-day', 'absent', 'leave'];

async function seed() {
  const conn = await pool.getConnection();
  try {
    // 1. Admin login
    const hashed = await bcrypt.hash('Admin@123', 10);
    await conn.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ('System Admin', 'admin@company.com', ?, 'admin')
       ON DUPLICATE KEY UPDATE password = VALUES(password)`,
      [hashed]
    );
    console.log('Admin user ready -> email: admin@company.com | password: Admin@123');

    // 2. Employees
    const employeeIds = [];
    for (const emp of employees) {
      await conn.query(
        `INSERT INTO employees
           (employee_code, full_name, email, phone, department, designation, date_of_joining, salary, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           full_name = VALUES(full_name), phone = VALUES(phone), department = VALUES(department),
           designation = VALUES(designation), salary = VALUES(salary), status = VALUES(status)`,
        [emp.code, emp.name, emp.email, emp.phone, emp.department, emp.designation, emp.doj, emp.salary, emp.status || 'active']
      );
      // insertId is 0 on duplicate-key update, so look the row up either way
      const [[row]] = await conn.query('SELECT id FROM employees WHERE employee_code = ?', [emp.code]);
      employeeIds.push(row.id);
    }
    console.log(`Seeded ${employees.length} employees.`);

    // 3. Today's attendance
    for (let i = 0; i < employeeIds.length; i++) {
      const status = attendanceStatus[i % attendanceStatus.length];
      const checkIn = status === 'absent' || status === 'leave' ? null : '09:15:00';
      const checkOut = status === 'present' ? '18:05:00' : status === 'half-day' ? '13:30:00' : null;
      await conn.query(
        `INSERT INTO attendance (employee_id, date, check_in, check_out, status)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE check_in = VALUES(check_in), check_out = VALUES(check_out), status = VALUES(status)`,
        [employeeIds[i], today, checkIn, checkOut, status]
      );
    }
    console.log(`Seeded attendance for ${today}.`);

    // 4. Leave requests (a mix of pending/approved/rejected)
    const leaveRequests = [
      { emp: 0, type: 'sick',   start: '2026-07-28', end: '2026-07-29', reason: 'Fever and cold',        status: 'approved' },
      { emp: 3, type: 'casual', start: '2026-08-05', end: '2026-08-06', reason: 'Family function',       status: 'pending'  },
      { emp: 5, type: 'earned', start: '2026-08-10', end: '2026-08-14', reason: 'Annual vacation',       status: 'pending'  },
      { emp: 6, type: 'unpaid', start: '2026-07-20', end: '2026-07-20', reason: 'Personal work',         status: 'rejected' },
    ];
    for (const lr of leaveRequests) {
      await conn.query(
        `INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [employeeIds[lr.emp], lr.type, lr.start, lr.end, lr.reason, lr.status]
      );
    }
    console.log(`Seeded ${leaveRequests.length} leave requests.`);

    // 5. Payroll for the current month
    const now = new Date();
    for (let i = 0; i < employeeIds.length; i++) {
      const basic = employees[i].salary;
      const allowances = Math.round(basic * 0.15);
      const deductions = Math.round(basic * 0.08);
      const net = basic + allowances - deductions;
      await conn.query(
        `INSERT INTO payroll (employee_id, month, year, basic_salary, allowances, deductions, net_salary)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE basic_salary = VALUES(basic_salary), allowances = VALUES(allowances),
           deductions = VALUES(deductions), net_salary = VALUES(net_salary)`,
        [employeeIds[i], now.getMonth() + 1, now.getFullYear(), basic, allowances, deductions, net]
      );
    }
    console.log('Seeded payroll for the current month.');

    // 6. Performance reviews
    const reviews = [
      { emp: 0, period: 'Q2 2026', rating: 4.2, comments: 'Consistently delivers clean, well-tested code.', by: 'Priya Nair' },
      { emp: 1, period: 'Q2 2026', rating: 4.8, comments: 'Excellent mentorship and technical leadership.',  by: 'System Admin' },
      { emp: 3, period: 'Q2 2026', rating: 3.6, comments: 'Met targets; could improve follow-up cadence.',   by: 'Vikram Singh' },
      { emp: 5, period: 'Q2 2026', rating: 4.0, comments: 'Strong campaign results this quarter.',           by: 'System Admin' },
    ];
    for (const r of reviews) {
      await conn.query(
        `INSERT INTO performance_reviews (employee_id, review_period, rating, comments, reviewed_by)
         VALUES (?, ?, ?, ?, ?)`,
        [employeeIds[r.emp], r.period, r.rating, r.comments, r.by]
      );
    }
    console.log(`Seeded ${reviews.length} performance reviews.`);

    console.log('\nSeeding complete! Log in with admin@company.com / Admin@123 to see the data.');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    conn.release();
    process.exit();
  }
}

seed();



const bcrypt = require('bcryptjs');
const pool = require('./config/db');

// ---------- Config ----------
const NUM_EMPLOYEES = 30;
const MONTHS_OF_HISTORY = 3; // attendance + payroll

// ---------- Reference data ----------
const FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Reyansh', 'Krishna', 'Ishaan',
  'Rohan', 'Karan', 'Ananya', 'Diya', 'Saanvi', 'Aadhya', 'Kiara', 'Myra',
  'Priya', 'Neha', 'Pooja', 'Riya', 'Amit', 'Rajesh', 'Suresh', 'Vikram',
  'Sanjay', 'Anjali', 'Kavita', 'Sunita', 'Deepak', 'Manoj', 'Nikhil', 'Rahul',
  'Simran', 'Tanvi', 'Ishita', 'Aryan', 'Yash', 'Om', 'Divya', 'Meera'
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Mehta', 'Joshi',
  'Reddy', 'Rao', 'Nair', 'Iyer', 'Chopra', 'Malhotra', 'Kapoor', 'Bhatt',
  'Agarwal', 'Bansal', 'Saxena', 'Chauhan', 'Yadav', 'Mishra', 'Pandey', 'Tiwari'
];

const DEPARTMENTS = {
  Engineering: ['Software Engineer', 'Senior Software Engineer', 'QA Engineer', 'DevOps Engineer', 'Engineering Manager'],
  'Human Resources': ['HR Executive', 'HR Manager', 'Talent Acquisition Specialist'],
  Sales: ['Sales Executive', 'Sales Manager', 'Business Development Associate'],
  Marketing: ['Marketing Executive', 'Content Strategist', 'Marketing Manager'],
  Finance: ['Accountant', 'Finance Analyst', 'Finance Manager'],
  Operations: ['Operations Executive', 'Operations Manager'],
  'Customer Support': ['Support Executive', 'Support Team Lead']
};

const SALARY_RANGES = {
  'Software Engineer': [55000, 85000],
  'Senior Software Engineer': [90000, 140000],
  'QA Engineer': [45000, 70000],
  'DevOps Engineer': [70000, 110000],
  'Engineering Manager': [150000, 220000],
  'HR Executive': [35000, 50000],
  'HR Manager': [80000, 120000],
  'Talent Acquisition Specialist': [40000, 60000],
  'Sales Executive': [30000, 45000],
  'Sales Manager': [75000, 110000],
  'Business Development Associate': [35000, 55000],
  'Marketing Executive': [35000, 50000],
  'Content Strategist': [45000, 65000],
  'Marketing Manager': [80000, 115000],
  Accountant: [40000, 60000],
  'Finance Analyst': [55000, 80000],
  'Finance Manager': [95000, 130000],
  'Operations Executive': [35000, 50000],
  'Operations Manager': [80000, 115000],
  'Support Executive': [28000, 42000],
  'Support Team Lead': [55000, 75000]
};

const LEAVE_TYPES = ['sick', 'casual', 'earned', 'unpaid'];
const LEAVE_STATUSES = ['pending', 'approved', 'approved', 'approved', 'rejected']; // weighted toward approved

// ---------- Helpers ----------
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[rand(0, arr.length - 1)];
const pad = (n) => String(n).padStart(2, '0');
const fmtDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function randomJoinDate() {
  const now = new Date();
  const daysAgo = rand(60, 5 * 365); // between 2 months and 5 years ago
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  return d;
}

function buildEmployees() {
  const employees = [];
  const usedNames = new Set();
  const deptNames = Object.keys(DEPARTMENTS);

  for (let i = 1; i <= NUM_EMPLOYEES; i++) {
    let fullName;
    do {
      fullName = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    } while (usedNames.has(fullName));
    usedNames.add(fullName);

    const department = pick(deptNames);
    const designation = pick(DEPARTMENTS[department]);
    const [min, max] = SALARY_RANGES[designation];
    const salary = rand(min, max);
    const joinDate = randomJoinDate();
    const emailBase = fullName.toLowerCase().replace(/\s+/g, '.');

    employees.push({
      employee_code: `EMP${String(i).padStart(4, '0')}`,
      full_name: fullName,
      email: `${emailBase}@company.com`,
      phone: `9${rand(100000000, 999999999)}`,
      department,
      designation,
      date_of_joining: fmtDate(joinDate),
      salary,
      status: Math.random() < 0.93 ? 'active' : 'inactive'
    });
  }
  return employees;
}

async function seedAdmin(conn) {
  const hashed = await bcrypt.hash('Admin@123', 10);
  await conn.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ('System Admin', 'admin@company.com', ?, 'admin')
     ON DUPLICATE KEY UPDATE password = VALUES(password)`,
    [hashed]
  );
  console.log('Admin user ready -> email: admin@company.com | password: Admin@123');
}

async function clearPreviousSampleData(conn) {
  // Order matters due to FKs; employees cascade to attendance/leave/payroll/performance.
  await conn.query(`DELETE FROM employees WHERE employee_code LIKE 'EMP%'`);
  await conn.query(`DELETE FROM users WHERE email LIKE '%@company.com' AND email != 'admin@company.com'`);
}

async function insertEmployeesAndUsers(conn, employees) {
  const hashed = await bcrypt.hash('Employee@123', 10);
  const idMap = []; // parallel array of inserted employee ids

  for (const emp of employees) {
    let userId = null;
    if (emp.status === 'active') {
      const [userRes] = await conn.query(
        `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'employee')`,
        [emp.full_name, emp.email, hashed]
      );
      userId = userRes.insertId;
    }

    const [empRes] = await conn.query(
      `INSERT INTO employees
        (user_id, employee_code, full_name, email, phone, department, designation, date_of_joining, salary, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, emp.employee_code, emp.full_name, emp.email, emp.phone, emp.department,
       emp.designation, emp.date_of_joining, emp.salary, emp.status]
    );
    idMap.push({ id: empRes.insertId, ...emp });
  }
  return idMap;
}

function isWeekday(d) {
  const day = d.getDay();
  return day !== 0 && day !== 6;
}

async function insertAttendance(conn, employees) {
  const today = new Date();
  const start = new Date(today);
  start.setMonth(start.getMonth() - MONTHS_OF_HISTORY);

  const rows = [];
  for (const emp of employees) {
    const joinDate = new Date(emp.date_of_joining);
    for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
      if (!isWeekday(d)) continue;
      if (d < joinDate) continue;
      if (emp.status === 'inactive' && Math.random() < 0.5) continue; // sparser records for inactive staff

      const roll = Math.random();
      let status, checkIn, checkOut;
      if (roll < 0.85) {
        status = 'present';
        checkIn = `${pad(rand(9, 9))}:${pad(rand(0, 45))}:00`;
        checkOut = `${pad(rand(17, 19))}:${pad(rand(0, 59))}:00`;
      } else if (roll < 0.92) {
        status = 'half-day';
        checkIn = `${pad(rand(9, 10))}:${pad(rand(0, 45))}:00`;
        checkOut = `${pad(rand(13, 14))}:${pad(rand(0, 45))}:00`;
      } else if (roll < 0.97) {
        status = 'leave';
        checkIn = null;
        checkOut = null;
      } else {
        status = 'absent';
        checkIn = null;
        checkOut = null;
      }

      rows.push([emp.id, fmtDate(new Date(d)), checkIn, checkOut, status]);
    }
  }

  // Batch insert in chunks
  const CHUNK = 500;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    await conn.query(
      `INSERT INTO attendance (employee_id, date, check_in, check_out, status) VALUES ?`,
      [chunk]
    );
  }
  return rows.length;
}

async function insertPayroll(conn, employees) {
  const now = new Date();
  let count = 0;

  for (const emp of employees) {
    const joinDate = new Date(emp.date_of_joining);

    for (let m = MONTHS_OF_HISTORY - 1; m >= 0; m--) {
      const period = new Date(now.getFullYear(), now.getMonth() - m, 1);
      if (period < new Date(joinDate.getFullYear(), joinDate.getMonth(), 1)) continue;

      const basic = emp.salary;
      const allowances = Math.round(basic * (0.08 + Math.random() * 0.12)); // 8-20% of basic
      const deductions = Math.round(basic * (0.03 + Math.random() * 0.07)); // 3-10% of basic
      const net = basic + allowances - deductions;

      await conn.query(
        `INSERT INTO payroll (employee_id, month, year, basic_salary, allowances, deductions, net_salary)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [emp.id, period.getMonth() + 1, period.getFullYear(), basic, allowances, deductions, net]
      );
      count++;
    }
  }
  return count;
}

async function insertLeaveRequests(conn, employees) {
  const now = new Date();
  let count = 0;

  for (const emp of employees) {
    const numRequests = rand(0, 3);
    for (let i = 0; i < numRequests; i++) {
      const daysAgo = rand(0, 90);
      const start = new Date(now);
      start.setDate(start.getDate() - daysAgo);
      const duration = rand(1, 4);
      const end = new Date(start);
      end.setDate(end.getDate() + duration - 1);

      const leaveType = pick(LEAVE_TYPES);
      const status = pick(LEAVE_STATUSES);
      const reasons = {
        sick: 'Not feeling well, need rest and recovery.',
        casual: 'Personal work to attend to.',
        earned: 'Planned family trip.',
        unpaid: 'Extended personal leave requested.'
      };

      await conn.query(
        `INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [emp.id, leaveType, fmtDate(start), fmtDate(end), reasons[leaveType], status]
      );
      count++;
    }
  }
  return count;
}

async function insertPerformanceReviews(conn, employees) {
  const reviewers = ['System Admin', 'HR Manager', 'Engineering Manager', 'Operations Manager'];
  const comments = [
    'Consistently meets expectations and collaborates well with the team.',
    'Shows strong initiative and delivers high-quality work on time.',
    'Good progress this period; could improve on communication.',
    'Exceeded targets and took ownership of key projects.',
    'Solid performance overall, with room to grow in leadership.',
    'Needs improvement in meeting deadlines consistently.'
  ];

  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  const periods = [];
  for (let i = 0; i < 2; i++) {
    let q = quarter - i;
    let y = now.getFullYear();
    if (q <= 0) { q += 4; y -= 1; }
    periods.push(`Q${q} ${y}`);
  }

  let count = 0;
  for (const emp of employees) {
    if (emp.status !== 'active') continue;
    for (const period of periods) {
      if (Math.random() < 0.15) continue; // some employees skip a review period
      const rating = (rand(25, 50) / 10).toFixed(1); // 2.5 - 5.0
      await conn.query(
        `INSERT INTO performance_reviews (employee_id, review_period, rating, comments, reviewed_by)
         VALUES (?, ?, ?, ?, ?)`,
        [emp.id, period, rating, pick(comments), pick(reviewers)]
      );
      count++;
    }
  }
  return count;
}

async function seed() {
  const conn = await pool.getConnection();
  try {
    await seedAdmin(conn);

    console.log('Clearing previously seeded sample data...');
    await clearPreviousSampleData(conn);

    console.log(`Generating ${NUM_EMPLOYEES} employees...`);
    const employeeDrafts = buildEmployees();
    const employees = await insertEmployeesAndUsers(conn, employeeDrafts);
    console.log(`  -> inserted ${employees.length} employees (+ login users, password: Employee@123)`);

    console.log(`Generating ~${MONTHS_OF_HISTORY} months of attendance...`);
    const attCount = await insertAttendance(conn, employees);
    console.log(`  -> inserted ${attCount} attendance records`);

    console.log('Generating payroll records...');
    const payCount = await insertPayroll(conn, employees);
    console.log(`  -> inserted ${payCount} payroll records`);

    console.log('Generating leave requests...');
    const leaveCount = await insertLeaveRequests(conn, employees);
    console.log(`  -> inserted ${leaveCount} leave requests`);

    console.log('Generating performance reviews...');
    const reviewCount = await insertPerformanceReviews(conn, employees);
    console.log(`  -> inserted ${reviewCount} performance reviews`);

    console.log('\nDone! Sample login credentials:');
    console.log('  Admin:    admin@company.com / Admin@123');
    console.log('  Employee: <any employee email>@company.com / Employee@123');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    conn.release();
    process.exit();
  }
}

seed();

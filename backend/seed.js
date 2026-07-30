// Run with: npm run seed
// Creates a default admin login: admin@company.com / Admin@123
const bcrypt = require('bcryptjs');
const pool = require('./config/db');

async function seed() {
  try {
    const hashed = await bcrypt.hash('Admin@123', 10);
    await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ('System Admin', 'admin@company.com', ?, 'admin')
       ON DUPLICATE KEY UPDATE password = VALUES(password)`,
      [hashed]
    );
    console.log('Admin user ready -> email: admin@company.com | password: Admin@123');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    process.exit();
  }
}

seed();

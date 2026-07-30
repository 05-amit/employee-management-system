# Employee Management System

A full-stack web app to manage employee records, attendance, leave requests, payroll, and performance tracking — matching the project brief:

- **Tech Stack:** React.js, Node.js, Express.js, MySQL
- **Key Features:** Employee records, attendance management, leave requests, payroll generation, performance tracking
- **Concepts Used:** CRUD operations, JWT authentication, report generation

## Project Structure

```
employee-management-system/
├── backend/          Node.js + Express + MySQL REST API
│   ├── config/       Database connection
│   ├── middleware/   JWT auth middleware
│   ├── models/        schema.sql (database schema)
│   ├── routes/        auth, employees, attendance, leave, payroll, performance
│   ├── seed.js        creates a default admin login
│   └── server.js      app entry point
└── frontend/         React (Vite) single-page app
    └── src/
        ├── api/        axios client
        ├── components/ Sidebar, ProtectedRoute
        └── pages/       Login, Dashboard, Employees, Attendance, Leave, Payroll, Performance
```

## 1. Database Setup (MySQL)

1. Make sure MySQL is installed and running.
2. Run the schema to create the database and tables:
   ```bash
   mysql -u root -p < backend/models/schema.sql
   ```

## 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env with your MySQL credentials and a JWT secret
npm run seed     # creates default admin: admin@company.com / Admin@123
npm run dev      # starts the API on http://localhost:5000
```

## 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev      # starts the app on http://localhost:5173
```

Open http://localhost:5173 and log in with:
- **Email:** admin@company.com
- **Password:** Admin@123

## API Overview

| Method | Endpoint                     | Description                          |
|--------|-------------------------------|---------------------------------------|
| POST   | /api/auth/register            | Create a user                        |
| POST   | /api/auth/login               | Log in, returns a JWT                |
| GET    | /api/employees                | List employees (search/filter)       |
| POST   | /api/employees                | Create employee (admin/hr)           |
| PUT    | /api/employees/:id            | Update employee (admin/hr)           |
| DELETE | /api/employees/:id            | Delete employee (admin)              |
| GET    | /api/attendance               | List attendance records              |
| POST   | /api/attendance/check-in      | Check in for today                   |
| POST   | /api/attendance/check-out     | Check out for today                  |
| GET    | /api/leave                    | List leave requests                  |
| POST   | /api/leave                    | Apply for leave                      |
| PUT    | /api/leave/:id/status         | Approve/reject leave (admin/hr)      |
| GET    | /api/payroll                  | List payslips                        |
| POST   | /api/payroll/generate         | Generate a payslip (admin/hr)        |
| GET    | /api/performance              | List performance reviews             |
| POST   | /api/performance              | Add a performance review (admin/hr)  |

## Roles

- **admin** – full access, including deleting employees
- **hr** – manage employees, attendance, leave approvals, payroll, reviews
- **employee** – view data, apply for leave, check in/out


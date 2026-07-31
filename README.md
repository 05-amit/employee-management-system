<div align="center">

# 👥 Employee Management System

### A full-stack web application to manage employee records, attendance, leave, payroll, and performance — all in one place.

</div>

---

## 📖 Overview

**Employee Management System (EMS)** is a full-stack web app built to match a real project brief:
create, track, and manage employee data end-to-end — from onboarding to payroll — through a clean,
role-based dashboard.

| | |
|---|---|
| 🧩 **Tech Stack** | React.js · Node.js · Express.js · MySQL |
| 🔑 **Key Features** | Employee records · Attendance · Leave requests · Payroll · Performance tracking |
| ⚙️ **Core Concepts** | CRUD operations · JWT authentication · Role-based access · Report generation |

---

## ✨ Features

- 🧑‍💼 **Employee Records** — Add, edit, search, and manage employee profiles
- 🕒 **Attendance Management** — Daily check-in / check-out tracking
- 📝 **Leave Requests** — Apply, approve, or reject leave with status tracking
- 💰 **Payroll Generation** — Generate and view payslips per employee
- 📈 **Performance Tracking** — Log and review employee performance
- 🔐 **JWT Authentication** — Secure, stateless login sessions
- 🛡️ **Role-Based Access** — Separate permissions for Admin, HR, and Employee

---

## 🗂️ Project Structure

```
employee-management-system/
├── backend/                 Node.js + Express + MySQL REST API
│   ├── config/               Database connection
│   ├── middleware/           JWT auth middleware
│   ├── models/                schema.sql (database schema)
│   ├── routes/                 auth, employees, attendance, leave, payroll, performance
│   ├── seed.js                 creates a default admin login
│   └── server.js               app entry point
│
└── frontend/                React (Vite) single-page app
    └── src/
        ├── api/               axios client
        ├── components/        Sidebar, ProtectedRoute
        └── pages/               Login, Dashboard, Employees, Attendance, Leave, Payroll, Performance
```

---

## 🚀 Getting Started

### 1️⃣ Database Setup (MySQL)

1. Make sure MySQL is installed and running.
2. Run the schema to create the database and tables:

   ```bash
   mysql -u root -p < backend/models/schema.sql
   ```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env with your MySQL credentials and a JWT secret
npm run seed     # creates default admin: admin@company.com / Admin@123
npm run dev      # starts the API on http://localhost:5000
```

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev      # starts the app on http://localhost:5173
```

Open **http://localhost:5173** and log in with:

---

## 📡 API Overview

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create a user |
| `POST` | `/api/auth/login` | Log in, returns a JWT |

### Employees

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/employees` | List employees (search/filter) |
| `POST` | `/api/employees` | Create employee _(admin/hr)_ |
| `PUT` | `/api/employees/:id` | Update employee _(admin/hr)_ |
| `DELETE` | `/api/employees/:id` | Delete employee _(admin)_ |

### Attendance

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/attendance` | List attendance records |
| `POST` | `/api/attendance/check-in` | Check in for today |
| `POST` | `/api/attendance/check-out` | Check out for today |

### Leave

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/leave` | List leave requests |
| `POST` | `/api/leave` | Apply for leave |
| `PUT` | `/api/leave/:id/status` | Approve/reject leave _(admin/hr)_ |

### Payroll

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/payroll` | List payslips |
| `POST` | `/api/payroll/generate` | Generate a payslip _(admin/hr)_ |

### Performance

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/performance` | List performance reviews |
| `POST` | `/api/performance` | Add a performance review _(admin/hr)_ |

---

## 🔐 Roles & Permissions

| Role | Access |
|---|---|
| 🛡️ **admin** | Full access, including deleting employees |
| 🧑‍💼 **hr** | Manage employees, attendance, leave approvals, payroll, reviews |
| 👤 **employee** | View data, apply for leave, check in/out |

---

## 📝 Notes

- Passwords are hashed with **bcrypt**; sessions are stateless **JWTs** (8h expiry by default).
- Extend this base by adding features like file uploads (employee photos/documents), email notifications for leave approvals, or PDF payslip export.

---

## 📄 License

This project is open-source and available under the MIT License.

<div align="center">

Made with ❤️ for streamlined workforce management

</div>

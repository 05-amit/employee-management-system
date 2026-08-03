import { useEffect, useMemo, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from 'recharts';
import api from '../api/axios';

// Matches the app's existing palette from index.css
const COLORS = ['#1f8a70', '#1c2b4a', '#a8730f', '#c0392b', '#2c4270', '#5b8fb9'];
const STATUS_COLORS = {
  present: '#1f8a70',
  'half-day': '#a8730f',
  leave: '#2c4270',
  absent: '#c0392b'
};
const LEAVE_STATUS_COLORS = { approved: '#1f8a70', pending: '#a8730f', rejected: '#c0392b' };

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Dashboard() {
  const [stats, setStats] = useState({ employees: 0, pendingLeaves: 0, presentToday: 0 });
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [leave, setLeave] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const now = new Date();
        const [empRes, leaveRes, attTodayRes, attMonthRes, payrollRes, allLeaveRes] = await Promise.all([
          api.get('/employees'),
          api.get('/leave', { params: { status: 'pending' } }),
          api.get('/attendance', { params: { date: now.toISOString().slice(0, 10) } }),
          api.get('/attendance', { params: { month: now.getMonth() + 1, year: now.getFullYear() } }),
          api.get('/payroll'),
          api.get('/leave')
        ]);

        setEmployees(empRes.data);
        setAttendance(attMonthRes.data);
        setPayroll(payrollRes.data);
        setLeave(allLeaveRes.data);
        setStats({
          employees: empRes.data.length,
          pendingLeaves: leaveRes.data.length,
          presentToday: attTodayRes.data.filter((a) => a.status === 'present').length
        });
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  // Employees grouped by department
  const departmentData = useMemo(() => {
    const counts = {};
    employees.forEach((e) => {
      const dept = e.department || 'Unassigned';
      counts[dept] = (counts[dept] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [employees]);

  // This month's attendance broken down by status
  const attendanceData = useMemo(() => {
    const counts = { present: 0, 'half-day': 0, leave: 0, absent: 0 };
    attendance.forEach((a) => {
      if (counts[a.status] !== undefined) counts[a.status] += 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [attendance]);

  // Payroll net salary total per month
  const payrollTrend = useMemo(() => {
    const totals = {};
    payroll.forEach((p) => {
      const key = `${p.year}-${String(p.month).padStart(2, '0')}`;
      totals[key] = (totals[key] || 0) + Number(p.net_salary);
    });
    return Object.entries(totals)
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([key, total]) => {
        const [year, month] = key.split('-');
        return { label: `${MONTH_LABELS[Number(month) - 1]} ${year}`, total: Math.round(total) };
      });
  }, [payroll]);

  // Leave requests grouped by status
  const leaveStatusData = useMemo(() => {
    const counts = {};
    leave.forEach((l) => {
      counts[l.status] = (counts[l.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [leave]);

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.employees}</div>
          <div className="stat-label">Total Employees</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.presentToday}</div>
          <div className="stat-label">Present Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.pendingLeaves}</div>
          <div className="stat-label">Pending Leave Requests</div>
        </div>
      </div>

      {!loading && employees.length === 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            No employee data yet. Run the seed script to populate sample data for these charts.
          </p>
        </div>
      )}

      <div className="chart-grid">
        <div className="card chart-card">
          <h2>Employees by Department</h2>
          {departmentData.length === 0 ? (
            <p className="chart-empty">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={departmentData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card chart-card">
          <h2>This Month's Attendance</h2>
          {attendance.length === 0 ? (
            <p className="chart-empty">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={attendanceData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {attendanceData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#999'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card chart-card">
          <h2>Payroll Trend (Net Salary)</h2>
          {payrollTrend.length === 0 ? (
            <p className="chart-empty">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={payrollTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e6ee" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Net Salary']} />
                <Line type="monotone" dataKey="total" stroke="#1f8a70" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card chart-card">
          <h2>Leave Requests by Status</h2>
          {leaveStatusData.length === 0 ? (
            <p className="chart-empty">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={leaveStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e6ee" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {leaveStatusData.map((entry) => (
                    <Cell key={entry.name} fill={LEAVE_STATUS_COLORS[entry.name] || '#999'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

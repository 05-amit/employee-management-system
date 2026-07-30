import { useEffect, useState } from 'react';
import api from '../api/axios';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Payroll() {
  const [payroll, setPayroll] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    employee_id: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(),
    allowances: 0, deductions: 0
  });

  async function loadData() {
    try {
      const [payRes, empRes] = await Promise.all([api.get('/payroll'), api.get('/employees')]);
      setPayroll(payRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      console.error('Failed to load payroll data', err);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function handleGenerate(e) {
    e.preventDefault();
    try {
      await api.post('/payroll/generate', form);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate payslip');
    }
  }

  return (
    <div>
      <h1 className="page-title">Payroll</h1>

      <form className="card form-card" onSubmit={handleGenerate}>
        <h2>Generate Payslip</h2>
        <div className="form-grid">
          <div>
            <label>Employee</label>
            <select value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} required>
              <option value="">Select employee…</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.employee_code})</option>
              ))}
            </select>
          </div>
          <div>
            <label>Month</label>
            <select value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })}>
              {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label>Year</label>
            <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
          </div>
          <div>
            <label>Allowances</label>
            <input type="number" value={form.allowances} onChange={(e) => setForm({ ...form, allowances: e.target.value })} />
          </div>
          <div>
            <label>Deductions</label>
            <input type="number" value={form.deductions} onChange={(e) => setForm({ ...form, deductions: e.target.value })} />
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" type="submit">Generate Payslip</button>
        </div>
      </form>

      <table className="data-table">
        <thead>
          <tr>
            <th>Employee</th><th>Month/Year</th><th>Basic</th><th>Allowances</th><th>Deductions</th><th>Net Salary</th>
          </tr>
        </thead>
        <tbody>
          {payroll.map((p) => (
            <tr key={p.id}>
              <td>{p.full_name} ({p.employee_code})</td>
              <td>{months[p.month - 1]} {p.year}</td>
              <td>{p.basic_salary}</td>
              <td>{p.allowances}</td>
              <td>{p.deductions}</td>
              <td><strong>{p.net_salary}</strong></td>
            </tr>
          ))}
          {payroll.length === 0 && (
            <tr><td colSpan="6" className="empty-row">No payslips generated yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

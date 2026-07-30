import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedEmployee, setSelectedEmployee] = useState('');

  async function loadData() {
    try {
      const [attRes, empRes] = await Promise.all([
        api.get('/attendance', { params: { date } }),
        api.get('/employees')
      ]);
      setRecords(attRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      console.error('Failed to load attendance', err);
    }
  }

  useEffect(() => { loadData(); }, [date]);

  async function handleCheckIn() {
    if (!selectedEmployee) return alert('Select an employee first');
    await api.post('/attendance/check-in', { employee_id: selectedEmployee });
    loadData();
  }

  async function handleCheckOut() {
    if (!selectedEmployee) return alert('Select an employee first');
    await api.post('/attendance/check-out', { employee_id: selectedEmployee });
    loadData();
  }

  return (
    <div>
      <h1 className="page-title">Attendance</h1>

      <div className="card form-card">
        <div className="form-grid">
          <div>
            <label>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label>Employee</label>
            <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
              <option value="">Select employee…</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.employee_code})</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" onClick={handleCheckIn}>Check In</button>
          <button className="btn btn-ghost" onClick={handleCheckOut}>Check Out</button>
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr><th>Employee</th><th>Date</th><th>Check In</th><th>Check Out</th><th>Status</th></tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id}>
              <td>{r.full_name} ({r.employee_code})</td>
              <td>{r.date?.slice ? r.date.slice(0, 10) : r.date}</td>
              <td>{r.check_in || '—'}</td>
              <td>{r.check_out || '—'}</td>
              <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
            </tr>
          ))}
          {records.length === 0 && (
            <tr><td colSpan="5" className="empty-row">No attendance records for this date.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

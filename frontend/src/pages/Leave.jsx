import { useEffect, useState } from 'react';
import api from '../api/axios';
import { getUser } from '../auth';

export default function Leave() {
  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ employee_id: '', leave_type: 'casual', start_date: '', end_date: '', reason: '' });
  const user = getUser();
  const canApprove = user?.role === 'admin' || user?.role === 'hr';

  async function loadData() {
    try {
      const [leaveRes, empRes] = await Promise.all([api.get('/leave'), api.get('/employees')]);
      setRequests(leaveRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      console.error('Failed to load leave data', err);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api.post('/leave', form);
      setForm({ employee_id: '', leave_type: 'casual', start_date: '', end_date: '', reason: '' });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit leave request');
    }
  }

  async function updateStatus(id, status) {
    try {
      await api.put(`/leave/${id}/status`, { status });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  }

  return (
    <div>
      <h1 className="page-title">Leave Requests</h1>

      <form className="card form-card" onSubmit={handleSubmit}>
        <h2>Apply for Leave</h2>
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
            <label>Leave Type</label>
            <select value={form.leave_type} onChange={(e) => setForm({ ...form, leave_type: e.target.value })}>
              <option value="casual">Casual</option>
              <option value="sick">Sick</option>
              <option value="earned">Earned</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
          <div>
            <label>Start Date</label>
            <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required />
          </div>
          <div>
            <label>End Date</label>
            <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} required />
          </div>
          <div className="form-full">
            <label>Reason</label>
            <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={2} />
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" type="submit">Submit Request</button>
        </div>
      </form>

      <table className="data-table">
        <thead>
          <tr>
            <th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Reason</th><th>Status</th>
            {canApprove && <th></th>}
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.id}>
              <td>{r.full_name} ({r.employee_code})</td>
              <td>{r.leave_type}</td>
              <td>{r.start_date?.slice ? r.start_date.slice(0, 10) : r.start_date}</td>
              <td>{r.end_date?.slice ? r.end_date.slice(0, 10) : r.end_date}</td>
              <td>{r.reason}</td>
              <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
              {canApprove && (
                <td className="table-actions">
                  {r.status === 'pending' && (
                    <>
                      <button className="btn btn-small" onClick={() => updateStatus(r.id, 'approved')}>Approve</button>
                      <button className="btn btn-small btn-danger" onClick={() => updateStatus(r.id, 'rejected')}>Reject</button>
                    </>
                  )}
                </td>
              )}
            </tr>
          ))}
          {requests.length === 0 && (
            <tr><td colSpan={canApprove ? 7 : 6} className="empty-row">No leave requests yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

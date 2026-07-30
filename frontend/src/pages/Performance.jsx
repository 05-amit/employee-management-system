import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Performance() {
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ employee_id: '', review_period: '', rating: 3, comments: '', reviewed_by: '' });

  async function loadData() {
    try {
      const [revRes, empRes] = await Promise.all([api.get('/performance'), api.get('/employees')]);
      setReviews(revRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      console.error('Failed to load performance data', err);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api.post('/performance', form);
      setForm({ employee_id: '', review_period: '', rating: 3, comments: '', reviewed_by: '' });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add review');
    }
  }

  return (
    <div>
      <h1 className="page-title">Performance Reviews</h1>

      <form className="card form-card" onSubmit={handleSubmit}>
        <h2>Add Review</h2>
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
            <label>Review Period</label>
            <input placeholder="e.g. Q1 2026" value={form.review_period} onChange={(e) => setForm({ ...form, review_period: e.target.value })} required />
          </div>
          <div>
            <label>Rating (1–5)</label>
            <input type="number" min="1" max="5" step="0.5" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
          </div>
          <div>
            <label>Reviewed By</label>
            <input value={form.reviewed_by} onChange={(e) => setForm({ ...form, reviewed_by: e.target.value })} />
          </div>
          <div className="form-full">
            <label>Comments</label>
            <textarea rows={2} value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} />
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" type="submit">Add Review</button>
        </div>
      </form>

      <table className="data-table">
        <thead>
          <tr><th>Employee</th><th>Period</th><th>Rating</th><th>Comments</th><th>Reviewed By</th></tr>
        </thead>
        <tbody>
          {reviews.map((r) => (
            <tr key={r.id}>
              <td>{r.full_name} ({r.employee_code})</td>
              <td>{r.review_period}</td>
              <td>⭐ {r.rating}</td>
              <td>{r.comments}</td>
              <td>{r.reviewed_by}</td>
            </tr>
          ))}
          {reviews.length === 0 && (
            <tr><td colSpan="5" className="empty-row">No performance reviews yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

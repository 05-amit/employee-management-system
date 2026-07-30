import { useEffect, useState } from 'react';
import api from '../api/axios';

const emptyForm = {
  employee_code: '', full_name: '', email: '', phone: '',
  department: '', designation: '', date_of_joining: '', salary: ''
};

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  async function loadEmployees() {
    try {
      const { data } = await api.get('/employees', { params: { search } });
      setEmployees(data);
    } catch (err) {
      console.error('Failed to load employees', err);
    }
  }

  useEffect(() => { loadEmployees(); }, [search]);

  function openNewForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError('');
  }

  function openEditForm(emp) {
    setForm({
      employee_code: emp.employee_code,
      full_name: emp.full_name,
      email: emp.email,
      phone: emp.phone || '',
      department: emp.department || '',
      designation: emp.designation || '',
      date_of_joining: emp.date_of_joining ? emp.date_of_joining.slice(0, 10) : '',
      salary: emp.salary
    });
    setEditingId(emp.id);
    setShowForm(true);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.put(`/employees/${editingId}`, { ...form, status: 'active' });
      } else {
        await api.post('/employees', form);
      }
      setShowForm(false);
      loadEmployees();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save employee');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this employee record?')) return;
    try {
      await api.delete(`/employees/${id}`);
      loadEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete employee');
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Employees</h1>
        <button className="btn btn-primary" onClick={openNewForm}>+ Add Employee</button>
      </div>

      <input
        className="search-input"
        placeholder="Search by name, code, or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {showForm && (
        <form className="card form-card" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Edit Employee' : 'New Employee'}</h2>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-grid">
            <div>
              <label>Employee Code</label>
              <input
                value={form.employee_code}
                onChange={(e) => setForm({ ...form, employee_code: e.target.value })}
                disabled={!!editingId}
                required
              />
            </div>
            <div>
              <label>Full Name</label>
              <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
            </div>
            <div>
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label>Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label>Department</label>
              <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            </div>
            <div>
              <label>Designation</label>
              <input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
            </div>
            <div>
              <label>Date of Joining</label>
              <input type="date" value={form.date_of_joining} onChange={(e) => setForm({ ...form, date_of_joining: e.target.value })} />
            </div>
            <div>
              <label>Salary</label>
              <input type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>Code</th><th>Name</th><th>Email</th><th>Department</th>
            <th>Designation</th><th>Salary</th><th>Status</th><th></th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.employee_code}</td>
              <td>{emp.full_name}</td>
              <td>{emp.email}</td>
              <td>{emp.department}</td>
              <td>{emp.designation}</td>
              <td>{emp.salary}</td>
              <td><span className={`badge badge-${emp.status}`}>{emp.status}</span></td>
              <td className="table-actions">
                <button className="btn btn-small" onClick={() => openEditForm(emp)}>Edit</button>
                <button className="btn btn-small btn-danger" onClick={() => handleDelete(emp.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {employees.length === 0 && (
            <tr><td colSpan="8" className="empty-row">No employees found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

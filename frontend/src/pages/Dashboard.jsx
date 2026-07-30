import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Dashboard() {
  const [stats, setStats] = useState({
    employees: 0,
    pendingLeaves: 0,
    presentToday: 0
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const [empRes, leaveRes, attRes] = await Promise.all([
          api.get('/employees'),
          api.get('/leave', { params: { status: 'pending' } }),
          api.get('/attendance', { params: { date: new Date().toISOString().slice(0, 10) } })
        ]);
        setStats({
          employees: empRes.data.length,
          pendingLeaves: leaveRes.data.length,
          presentToday: attRes.data.filter((a) => a.status === 'present').length
        });
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      }
    }
    loadStats();
  }, []);

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
    </div>
  );
}

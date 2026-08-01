import { useEffect, useState } from 'react';
import api from '../api/axios';
import { getUser } from '../auth';

const icons = {
  employees: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  present: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  pending: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
};

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const user = getUser();
  const [stats, setStats] = useState({ employees: 0, pendingLeaves: 0, presentToday: 0 });
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div>
      <div className="dash-header">
        <div>
          <h1 className="page-title">{greeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</h1>
          <p className="dash-date">{today}</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card stat-card--navy">
          <div className="stat-icon">{icons.employees}</div>
          <div>
            <div className="stat-value">{loading ? '—' : stats.employees}</div>
            <div className="stat-label">Total Employees</div>
          </div>
        </div>
        <div className="stat-card stat-card--accent">
          <div className="stat-icon">{icons.present}</div>
          <div>
            <div className="stat-value">{loading ? '—' : stats.presentToday}</div>
            <div className="stat-label">Present Today</div>
          </div>
        </div>
        <div className="stat-card stat-card--amber">
          <div className="stat-icon">{icons.pending}</div>
          <div>
            <div className="stat-value">{loading ? '—' : stats.pendingLeaves}</div>
            <div className="stat-label">Pending Leave Requests</div>
          </div>
        </div>
      </div>
    </div>
  );
}

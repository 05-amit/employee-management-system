import { NavLink } from 'react-router-dom';
import { getUser, logout } from '../auth';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/employees', label: 'Employees' },
  { to: '/attendance', label: 'Attendance' },
  { to: '/leave', label: 'Leave Requests' },
  { to: '/payroll', label: 'Payroll' },
  { to: '/performance', label: 'Performance' }
];

export default function Sidebar() {
  const user = getUser();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">EMS</div>
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-user">
        <div className="sidebar-user-name">{user?.name}</div>
        <div className="sidebar-user-role">{user?.role}</div>
        <button className="btn btn-ghost" onClick={logout}>Log out</button>
      </div>
    </aside>
  );
}

import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import Leave from './pages/Leave';
import Payroll from './pages/Payroll';
import Performance from './pages/Performance';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>
      } />
      <Route path="/employees" element={
        <ProtectedRoute><AppLayout><Employees /></AppLayout></ProtectedRoute>
      } />
      <Route path="/attendance" element={
        <ProtectedRoute><AppLayout><Attendance /></AppLayout></ProtectedRoute>
      } />
      <Route path="/leave" element={
        <ProtectedRoute><AppLayout><Leave /></AppLayout></ProtectedRoute>
      } />
      <Route path="/payroll" element={
        <ProtectedRoute><AppLayout><Payroll /></AppLayout></ProtectedRoute>
      } />
      <Route path="/performance" element={
        <ProtectedRoute><AppLayout><Performance /></AppLayout></ProtectedRoute>
      } />
    </Routes>
  );
}

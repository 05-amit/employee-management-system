import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
  const [email, setEmail] = useState('admin@company.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />

      <form
        className={`auth-card${shake ? ' auth-card-shake' : ''}`}
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="auth-logo">EMS</div>
        <h1>Employee Management System</h1>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        {error && (
          <div className="alert alert-error" role="alert">
            <svg viewBox="0 0 20 20" fill="currentColor" className="alert-icon">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.5a.75.75 0 00-1.5 0v4a.75.75 0 001.5 0v-4zM10 13.5a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="field-group">
          <label htmlFor="email">Email</label>
          <div className="input-with-icon">
            <svg viewBox="0 0 20 20" fill="currentColor" className="input-icon">
              <path d="M2.94 6.94a2 2 0 011.4-.57h11.32a2 2 0 011.4.57L10 11.5 2.94 6.94z" />
              <path d="M18 8.12l-7.4 4.94a1 1 0 01-1.2 0L2 8.12V13.5a2 2 0 002 2h12a2 2 0 002-2V8.12z" />
            </svg>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
          </div>
        </div>

        <div className="field-group">
          <label htmlFor="password">Password</label>
          <div className="input-with-icon">
            <svg viewBox="0 0 20 20" fill="currentColor" className="input-icon">
              <path fillRule="evenodd" d="M10 1a4 4 0 00-4 4v2H5a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2V9a2 2 0 00-2-2h-1V5a4 4 0 00-4-4zm2 6V5a2 2 0 10-4 0v2h4z" clipRule="evenodd" />
            </svg>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              className="input-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? (
                <svg viewBox="0 0 20 20" fill="currentColor" className="input-icon">
                  <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.62-1.62A11.05 11.05 0 0019.5 10c-1.4-3.9-5.3-6.5-9.5-6.5-1.6 0-3.13.38-4.48 1.06L3.28 2.22zm4.66 4.66a4 4 0 015.18 5.18L7.94 6.88zM10 4.5c1.62 0 3.13.38 4.48 1.06l-1.55 1.55a4.5 4.5 0 00-5.92 5.92l-2.1 2.1A11.9 11.9 0 01.5 10c1.4-3.9 5.3-5.5 9.5-5.5z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" fill="currentColor" className="input-icon">
                  <path d="M10 3.5C5.8 3.5 1.9 6.1.5 10c1.4 3.9 5.3 6.5 9.5 6.5s8.1-2.6 9.5-6.5C18.1 6.1 14.2 3.5 10 3.5zM10 14a4 4 0 110-8 4 4 0 010 8z" />
                  <path d="M10 8a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="auth-row">
          <label className="checkbox-label">
            <input type="checkbox" defaultChecked />
            <span>Remember me</span>
          </label>
        </div>

        <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
          {loading ? (
            <span className="btn-loading">
              <span className="spinner" />
              Signing in…
            </span>
          ) : (
            'Sign in'
          )}
        </button>

        
      </form>
    </div>
  );
}


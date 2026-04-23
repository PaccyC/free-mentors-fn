import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { logout } from '../store/authSlice';

export default function Navbar() {
  const { user, token } = useSelector((s: RootState) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setMobileOpen(false);
  };

  const close = () => setMobileOpen(false);

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : null;

  return (
    <nav className="bg-indigo-700 text-white shadow-md relative z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="text-xl font-bold tracking-wide hover:text-indigo-200 flex items-center gap-2">
          <span className="text-2xl">🎓</span>
          FreeMentors
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-5 text-sm font-medium">
          <Link to="/mentors" className="hover:text-indigo-200 transition-colors">
            Find Mentors
          </Link>
          {token ? (
            <>
              {user?.role === 'ADMIN' && (
                <Link to="/admin" className="hover:text-indigo-200 transition-colors">
                  Admin Panel
                </Link>
              )}
              <Link
                to={user?.role === 'MENTOR' ? '/mentor-dashboard' : '/dashboard'}
                className="hover:text-indigo-200 transition-colors"
              >
                My Sessions
              </Link>
              <div className="flex items-center gap-2 pl-3 border-l border-indigo-500">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">
                  {initials}
                </div>
                <span className="text-indigo-200 text-xs">
                  {user?.firstName}{' '}
                  <span className="bg-indigo-600 px-1.5 py-0.5 rounded text-indigo-100">
                    {user?.role}
                  </span>
                </span>
                <button
                  onClick={handleLogout}
                  className="ml-1 bg-white text-indigo-700 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-indigo-200 transition-colors">
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-white text-indigo-700 px-4 py-1.5 rounded-lg font-semibold hover:bg-indigo-100 transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded hover:bg-indigo-600 transition-colors"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-indigo-800 border-t border-indigo-600 px-4 py-4 flex flex-col gap-3 text-sm font-medium">
          <Link to="/mentors" className="hover:text-indigo-200" onClick={close}>
            Find Mentors
          </Link>
          {token ? (
            <>
              {user?.role === 'ADMIN' && (
                <Link to="/admin" className="hover:text-indigo-200" onClick={close}>
                  Admin Panel
                </Link>
              )}
              <Link
                to={user?.role === 'MENTOR' ? '/mentor-dashboard' : '/dashboard'}
                className="hover:text-indigo-200"
                onClick={close}
              >
                My Sessions
              </Link>
              <div className="pt-2 border-t border-indigo-600 flex items-center justify-between">
                <span className="text-indigo-300 text-xs">
                  {user?.firstName} {user?.lastName} · {user?.role}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-white text-indigo-700 px-3 py-1 rounded-lg text-xs font-semibold"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-indigo-200" onClick={close}>
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-white text-indigo-700 px-4 py-1.5 rounded-lg text-center font-semibold"
                onClick={close}
              >
                Get Started Free
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { logout } from '../store/authSlice';

export default function Navbar() {
  const { user, token } = useSelector((s: RootState) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setMobileOpen(false);
  };

  const close = () => setMobileOpen(false);
  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : null;
  const dashPath = user?.role === 'MENTOR' ? '/mentor-dashboard' : '/dashboard';

  const isActive = (path: string) =>
    location.pathname === path
      ? 'text-white font-semibold'
      : 'text-indigo-200 hover:text-white';

  return (
    <nav className="bg-indigo-700 text-white shadow-md relative z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          to="/"
          onClick={close}
          className="text-lg sm:text-xl font-bold tracking-wide hover:text-indigo-200 flex items-center gap-2 shrink-0"
        >
          <span className="text-xl sm:text-2xl">🎓</span>
          <span>FreeMentors</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-5 text-sm font-medium">
          <Link to="/mentors" className={`transition-colors ${isActive('/mentors')}`}>
            Find Mentors
          </Link>

          {token ? (
            <>
              {user?.role === 'ADMIN' && (
                <Link to="/admin" className={`transition-colors ${isActive('/admin')}`}>
                  Admin Panel
                </Link>
              )}
              <Link to={dashPath} className={`transition-colors ${isActive(dashPath)}`}>
                My Sessions
              </Link>

              <div className="flex items-center gap-2 pl-3 border-l border-indigo-500">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold shrink-0">
                  {initials}
                </div>
                <span className="text-indigo-200 text-xs leading-tight">
                  {user?.firstName}
                  <span className="block bg-indigo-600 px-1 rounded text-indigo-100 text-center" style={{ fontSize: '0.65rem' }}>
                    {user?.role}
                  </span>
                </span>
                <button
                  onClick={handleLogout}
                  className="ml-1 bg-white text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className={`transition-colors ${isActive('/login')}`}>
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

        {/* Mobile: user initials + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          {token && (
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">
              {initials}
            </div>
          )}
          <button
            className="p-2 rounded-lg hover:bg-indigo-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
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
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-indigo-800 border-t border-indigo-600 px-4 py-2 flex flex-col">
          <MobileLink to="/mentors" active={location.pathname === '/mentors'} onClick={close}>
            Find Mentors
          </MobileLink>

          {token ? (
            <>
              {user?.role === 'ADMIN' && (
                <MobileLink to="/admin" active={location.pathname === '/admin'} onClick={close}>
                  Admin Panel
                </MobileLink>
              )}
              <MobileLink to={dashPath} active={location.pathname === dashPath} onClick={close}>
                My Sessions
              </MobileLink>

              <div className="border-t border-indigo-600 mt-1 pt-3 pb-2 flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold text-sm">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-indigo-300 text-xs">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-white text-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold min-h-[44px]"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <MobileLink to="/login" active={location.pathname === '/login'} onClick={close}>
                Sign In
              </MobileLink>
              <div className="py-2">
                <Link
                  to="/signup"
                  onClick={close}
                  className="block w-full text-center bg-white text-indigo-700 px-4 py-3 rounded-xl font-semibold text-sm"
                >
                  Get Started Free
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

function MobileLink({
  to, active, onClick, children,
}: {
  to: string; active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`py-3 px-1 text-sm font-medium border-b border-indigo-700 last:border-0 min-h-[44px] flex items-center transition-colors ${
        active ? 'text-white' : 'text-indigo-200 hover:text-white'
      }`}
    >
      {children}
    </Link>
  );
}

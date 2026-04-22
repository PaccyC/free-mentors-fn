import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { logout } from '../store/authSlice';

export default function Navbar() {
  const { user, token } = useSelector((s: RootState) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="bg-indigo-700 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-wide hover:text-indigo-200">
          FreeMentors
        </Link>
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link to="/mentors" className="hover:text-indigo-200">
            Find Mentors
          </Link>
          {token ? (
            <>
              {user?.role === 'ADMIN' && (
                <Link to="/admin" className="hover:text-indigo-200">
                  Admin
                </Link>
              )}
              {user?.role === 'MENTOR' ? (
                <Link to="/mentor-dashboard" className="hover:text-indigo-200">
                  My Sessions
                </Link>
              ) : (
                <Link to="/dashboard" className="hover:text-indigo-200">
                  My Sessions
                </Link>
              )}
              <span className="text-indigo-300">
                {user?.firstName} ({user?.role})
              </span>
              <button
                onClick={handleLogout}
                className="bg-white text-indigo-700 px-3 py-1 rounded hover:bg-indigo-100"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-indigo-200">
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-white text-indigo-700 px-3 py-1 rounded hover:bg-indigo-100"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

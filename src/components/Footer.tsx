import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        <div className="sm:col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🎓</span>
            <h3 className="text-white font-bold text-lg">FreeMentors</h3>
          </div>
          <p className="text-sm leading-relaxed max-w-xs">
            Connecting ambitious people with experienced professionals — completely free, always.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Navigate</h4>
          <ul className="space-y-2.5 text-sm">
            {[
              { to: '/', label: 'Home' },
              { to: '/mentors', label: 'Find Mentors' },
              { to: '/signup', label: 'Join Free' },
              { to: '/login', label: 'Sign In' },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-white transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Your Account</h4>
          <ul className="space-y-2.5 text-sm">
            {[
              { to: '/dashboard', label: 'My Sessions' },
              { to: '/mentor-dashboard', label: 'Mentor Dashboard' },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-white transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 text-center py-4 text-xs text-gray-600 px-4">
        © {new Date().getFullYear()} FreeMentors. All rights reserved.
        <span className="mx-2">·</span>
        Made with ♥ for the community.
      </div>
    </footer>
  );
}

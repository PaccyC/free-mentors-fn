import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white font-bold text-lg mb-3">FreeMentors</h3>
          <p className="text-sm leading-relaxed">
            Connecting ambitious professionals with those who need guidance — completely free, always.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Navigate</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link to="/mentors" className="hover:text-white transition-colors">Find Mentors</Link></li>
            <li><Link to="/signup" className="hover:text-white transition-colors">Join Free</Link></li>
            <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Your Account</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/dashboard" className="hover:text-white transition-colors">My Sessions</Link></li>
            <li><Link to="/mentor-dashboard" className="hover:text-white transition-colors">Mentor Dashboard</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 text-center py-4 text-xs text-gray-600">
        © {new Date().getFullYear()} FreeMentors. All rights reserved. Made with ♥ for the community.
      </div>
    </footer>
  );
}

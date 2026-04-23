import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-8xl font-extrabold text-indigo-200 mb-4 select-none">404</div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Page Not Found</h1>
      <p className="text-gray-500 max-w-md mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <Link
          to="/"
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          Go Home
        </Link>
        <Link
          to="/mentors"
          className="border border-indigo-600 text-indigo-600 px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
        >
          Browse Mentors
        </Link>
      </div>
    </div>
  );
}

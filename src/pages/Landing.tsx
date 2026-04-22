import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

export default function Landing() {
  const { token } = useSelector((s: RootState) => s.auth);

  return (
    <div>
      {/* Hero */}
      <section className="bg-linear-to-br from-indigo-700 to-indigo-500 text-white py-24 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
          Connect with Free Mentors
        </h1>
        <p className="text-lg md:text-xl text-indigo-100 max-w-xl mx-auto mb-8">
          Accomplished professionals volunteering their time to guide the next generation — for free.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          {token ? (
            <Link
              to="/mentors"
              className="bg-white text-indigo-700 font-semibold px-6 py-3 rounded-lg shadow hover:bg-indigo-50"
            >
              Browse Mentors
            </Link>
          ) : (
            <>
              <Link
                to="/signup"
                className="bg-white text-indigo-700 font-semibold px-6 py-3 rounded-lg shadow hover:bg-indigo-50"
              >
                Get Started Free
              </Link>
              <Link
                to="/mentors"
                className="border border-white text-white font-semibold px-6 py-3 rounded-lg hover:bg-indigo-600"
              >
                Browse Mentors
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: '1',
              title: 'Create an Account',
              desc: 'Sign up for free and complete your profile.',
            },
            {
              step: '2',
              title: 'Find a Mentor',
              desc: 'Browse experienced professionals across various fields.',
            },
            {
              step: '3',
              title: 'Request a Session',
              desc: 'Send a mentorship request and start learning.',
            },
          ].map((item) => (
            <div key={item.step} className="text-center p-6 bg-white rounded-xl shadow">
              <div className="w-12 h-12 bg-indigo-600 text-white text-xl font-bold rounded-full flex items-center justify-center mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

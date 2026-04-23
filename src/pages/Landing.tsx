import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

const stats = [
  { value: '100+', label: 'Mentors' },
  { value: '500+', label: 'Sessions' },
  { value: '100%', label: 'Free' },
  { value: '20+', label: 'Industries' },
];

const steps = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    title: 'Create an Account',
    desc: 'Sign up for free in under a minute and complete your profile.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: 'Find a Mentor',
    desc: 'Browse experienced professionals across engineering, design, business, and more.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: 'Request a Session',
    desc: 'Send a mentorship request, schedule a time, and start learning.',
  },
];

const testimonials = [
  {
    quote: "Getting access to a senior engineer who genuinely cared about my growth changed my career trajectory completely.",
    name: 'Sarah K.',
    role: 'Junior Developer',
  },
  {
    quote: "I've mentored over 20 people here. Giving back is incredibly rewarding and the platform makes it effortless.",
    name: 'James O.',
    role: 'Engineering Manager',
  },
  {
    quote: "Found my mentor within a day and landed my first job three months later. This platform is amazing.",
    name: 'Alice M.',
    role: 'UX Designer',
  },
];

export default function Landing() {
  const { token } = useSelector((s: RootState) => s.auth);

  return (
    <div>
      {/* Hero */}
      <section className="bg-linear-to-br from-indigo-700 to-indigo-500 text-white py-28 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="relative">
          <span className="inline-block bg-indigo-600 text-indigo-100 text-xs font-semibold px-3 py-1 rounded-full mb-5 tracking-wide uppercase">
            100% Free · Always
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-5 leading-tight max-w-3xl mx-auto">
            Connect with Expert Mentors for Free
          </h1>
          <p className="text-lg md:text-xl text-indigo-100 max-w-xl mx-auto mb-10 leading-relaxed">
            Accomplished professionals volunteering their time to guide the next generation — no fees, no gatekeeping.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            {token ? (
              <Link
                to="/mentors"
                className="bg-white text-indigo-700 font-semibold px-7 py-3.5 rounded-xl shadow-lg hover:bg-indigo-50 transition-colors"
              >
                Browse Mentors →
              </Link>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="bg-white text-indigo-700 font-semibold px-7 py-3.5 rounded-xl shadow-lg hover:bg-indigo-50 transition-colors"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/mentors"
                  className="border-2 border-white text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-indigo-600 transition-colors"
                >
                  Browse Mentors
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-indigo-600 text-white py-4 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {stats.map((s) => (
            <div key={s.label} className="py-2">
              <div className="text-2xl font-extrabold">{s.value}</div>
              <div className="text-indigo-200 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">How It Works</h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            Three simple steps to connect with a mentor who can guide your career.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((item, i) => (
            <div key={i} className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
                {item.icon}
              </div>
              <div className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2">Step {i + 1}</div>
              <h3 className="font-bold text-gray-800 text-lg mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">What People Say</h2>
            <p className="text-gray-500">Hear from mentees and mentors who've used the platform.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      {!token && (
        <section className="py-20 px-4 text-center bg-indigo-700 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to level up your career?</h2>
          <p className="text-indigo-200 max-w-md mx-auto mb-8">
            Join thousands of people connecting with mentors who've been exactly where you are.
          </p>
          <Link
            to="/signup"
            className="bg-white text-indigo-700 font-bold px-8 py-3.5 rounded-xl shadow hover:bg-indigo-50 transition-colors inline-block"
          >
            Create a Free Account
          </Link>
        </section>
      )}
    </div>
  );
}

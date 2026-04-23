import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CircularProgress, Alert } from '@mui/material';
import { gql } from '../../api/client';
import { GET_MENTORS } from '../../api/queries';
import type { User } from '../../types';
import type { RootState } from '../../store';

export default function MentorsList() {
  const { user: currentUser } = useSelector((s: RootState) => s.auth);
  const [mentors, setMentors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    gql<{ mentors: User[] }>(GET_MENTORS)
      .then((d) => setMentors(d.mentors))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><CircularProgress /></div>;
  if (error) return <div className="p-8"><Alert severity="error">{error}</Alert></div>;

  const filtered = mentors
    .filter((m) => m.id !== currentUser?.id)
    .filter((m) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) ||
        (m.occupation ?? '').toLowerCase().includes(q) ||
        (m.expertise ?? '').toLowerCase().includes(q)
      );
    });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">Find a Mentor</h1>
        <p className="text-gray-500">Connect with experienced professionals ready to guide you — for free.</p>
      </div>

      {/* Search */}
      <div className="mb-8 relative">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search by name, occupation, or expertise…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
          aria-label="Search mentors"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute left-[calc(min(100%,28rem)-2rem)] top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
          {search ? (
            <>
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-gray-700 font-medium">No mentors match "{search}"</p>
              <p className="text-gray-400 text-sm mt-1">Try a different keyword or clear the search.</p>
              <button
                onClick={() => setSearch('')}
                className="mt-4 text-indigo-600 text-sm hover:underline"
              >
                Clear search
              </button>
            </>
          ) : (
            <>
              <div className="text-4xl mb-4">👥</div>
              <p className="text-gray-500 text-lg">No mentors available yet.</p>
              <p className="text-gray-400 text-sm mt-1">Check back soon!</p>
            </>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-400 mb-4">
            {filtered.length} mentor{filtered.length !== 1 ? 's' : ''} found
            {search && ` for "${search}"`}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((m) => (
              <div key={m.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 hover:shadow-md transition-shadow group">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl shrink-0">
                    {m.firstName[0]}{m.lastName[0]}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-800 text-base truncate">
                      {m.firstName} {m.lastName}
                    </h3>
                    <p className="text-indigo-600 text-sm font-medium truncate">{m.occupation}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(m.expertise ?? '').split(',').slice(0, 3).map((tag) => tag.trim()).filter(Boolean).map((tag) => (
                    <span key={tag} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-medium">
                      {tag}
                    </span>
                  ))}
                </div>

                {m.bio && (
                  <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{m.bio}</p>
                )}

                <Link
                  to={`/mentors/${m.id}`}
                  className="mt-auto block text-center bg-indigo-600 text-white text-sm font-semibold py-2.5 px-4 rounded-xl hover:bg-indigo-700 transition-colors group-hover:shadow-sm"
                >
                  View Profile
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

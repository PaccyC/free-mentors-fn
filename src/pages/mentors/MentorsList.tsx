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

  useEffect(() => {
    gql<{ mentors: User[] }>(GET_MENTORS)
      .then((d) => setMentors(d.mentors))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><CircularProgress /></div>;
  if (error) return <div className="p-8"><Alert severity="error">{error}</Alert></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Find a Mentor</h1>
      <p className="text-gray-500 mb-8">Connect with experienced professionals ready to guide you.</p>

      {mentors.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No mentors available yet.</p>
          <p className="text-sm mt-1">Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.filter((m) => m.id !== currentUser?.id).map((m) => (
            <div key={m.id} className="bg-white rounded-2xl shadow p-6 flex flex-col gap-3 hover:shadow-md transition">
              <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl">
                {m.firstName[0]}{m.lastName[0]}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-lg">
                  {m.firstName} {m.lastName}
                </h3>
                <p className="text-indigo-600 text-sm font-medium">{m.occupation}</p>
              </div>
              <p className="text-sm text-gray-500 font-medium">
                Expertise: <span className="text-gray-700">{m.expertise}</span>
              </p>
              {m.bio && <p className="text-sm text-gray-500 line-clamp-2">{m.bio}</p>}
              <Link
                to={`/mentors/${m.id}`}
                className="mt-auto inline-block text-center bg-[#0d6efd] text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-[#0b5ed7]"
              >
                View Profile
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

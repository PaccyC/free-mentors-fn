import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { CircularProgress, Alert, Chip } from '@mui/material';
import { gql } from '../../api/client';
import { GET_MY_SESSIONS } from '../../api/queries';
import type { MentorshipSession } from '../../types';
import type { RootState } from '../../store';
import { Link } from 'react-router-dom';

const statusColor: Record<string, 'default' | 'warning' | 'success' | 'error'> = {
  PENDING: 'warning',
  ACCEPTED: 'success',
  DECLINED: 'error',
};

export default function Dashboard() {
  const { token, user } = useSelector((s: RootState) => s.auth);
  const [sessions, setSessions] = useState<MentorshipSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    gql<{ mySessions: MentorshipSession[] }>(GET_MY_SESSIONS, {}, token)
      .then((d) => setSessions(d.mySessions))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="flex justify-center py-20"><CircularProgress /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">My Sessions</h1>
      <p className="text-gray-500 mb-6">Hello, {user?.firstName}! Here are your mentorship requests.</p>

      {error && <Alert severity="error" className="mb-4">{error}</Alert>}

      {sessions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow">
          <p className="text-gray-400 text-lg">No sessions yet.</p>
          <Link
            to="/mentors"
            className="inline-block mt-4 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-indigo-700"
          >
            Find a Mentor
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {sessions.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-800">
                    {s.mentor.firstName} {s.mentor.lastName}
                  </p>
                  <p className="text-sm text-indigo-600">{s.mentor.occupation}</p>
                  {s.scheduledAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      Scheduled: {new Date(s.scheduledAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <Chip label={s.status} color={statusColor[s.status]} size="small" />
              </div>
              <p className="text-gray-600 text-sm mt-3 bg-gray-50 rounded-lg p-3">
                {s.questions}
              </p>
              {s.status === 'ACCEPTED' && (
                <div className="mt-3">
                  <Link
                    to={`/mentors/${s.mentor.id}`}
                    className="text-indigo-600 text-sm hover:underline"
                  >
                    Leave a review →
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

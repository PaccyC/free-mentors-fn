import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { CircularProgress, Alert, Chip } from '@mui/material';
import { gql } from '../../api/client';
import { GET_MY_SESSIONS } from '../../api/queries';
import type { MentorshipSession } from '../../types';
import type { RootState } from '../../store';

const statusColor: Record<string, 'default' | 'warning' | 'success' | 'error'> = {
  PENDING: 'warning',
  ACCEPTED: 'success',
  DECLINED: 'error',
};

const statusLabel: Record<string, string> = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  DECLINED: 'Declined',
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

  const pending = sessions.filter((s) => s.status === 'PENDING').length;
  const accepted = sessions.filter((s) => s.status === 'ACCEPTED').length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">My Sessions</h1>
        <p className="text-gray-500 text-sm sm:text-base">
          Hello, <span className="font-semibold text-gray-700">{user?.firstName}</span>! Here are your mentorship requests.
        </p>
      </div>

      {/* Summary chips - only if there are sessions */}
      {sessions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full font-medium">
            {sessions.length} total
          </span>
          {pending > 0 && (
            <span className="text-xs bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full font-medium">
              {pending} pending
            </span>
          )}
          {accepted > 0 && (
            <span className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-full font-medium">
              {accepted} accepted
            </span>
          )}
        </div>
      )}

      {error && <Alert severity="error" className="mb-4">{error}</Alert>}

      {sessions.length === 0 ? (
        <div className="text-center py-16 sm:py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="text-5xl mb-4">🤝</div>
          <p className="text-gray-700 font-semibold text-lg mb-1">No sessions yet</p>
          <p className="text-gray-400 text-sm mb-6">Find a mentor and send your first request!</p>
          <Link
            to="/mentors"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            Find a Mentor
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:gap-4">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow"
            >
              {/* Card header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                    {s.mentor.firstName[0]}{s.mentor.lastName[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                      {s.mentor.firstName} {s.mentor.lastName}
                    </p>
                    <p className="text-xs sm:text-sm text-indigo-600 truncate">{s.mentor.occupation}</p>
                    {s.scheduledAt && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        📅 {new Date(s.scheduledAt).toLocaleDateString(undefined, {
                          weekday: 'short', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                </div>
                <Chip
                  label={statusLabel[s.status] ?? s.status}
                  color={statusColor[s.status]}
                  size="small"
                  sx={{ shrink: 0 }}
                />
              </div>

              {/* Questions */}
              <p className="text-gray-600 text-sm bg-gray-50 rounded-xl p-3 leading-relaxed line-clamp-3">
                {s.questions}
              </p>

              {s.status === 'ACCEPTED' && (
                <div className="mt-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <Link
                    to={`/mentors/${s.mentor.id}`}
                    className="text-indigo-600 text-sm font-medium hover:underline"
                  >
                    Leave a review for {s.mentor.firstName}
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

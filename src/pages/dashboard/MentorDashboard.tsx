import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { CircularProgress, Alert, Chip, Button, useMediaQuery } from '@mui/material';
import { gql } from '../../api/client';
import { GET_MENTOR_SESSIONS } from '../../api/queries';
import { ACCEPT_SESSION, DECLINE_SESSION } from '../../api/mutations';
import type { MentorshipSession } from '../../types';
import type { RootState } from '../../store';

const statusColor: Record<string, 'default' | 'warning' | 'success' | 'error'> = {
  PENDING: 'warning',
  ACCEPTED: 'success',
  DECLINED: 'error',
};

export default function MentorDashboard() {
  const { token, user } = useSelector((s: RootState) => s.auth);
  const isMobile = useMediaQuery('(max-width:600px)');
  const [sessions, setSessions] = useState<MentorshipSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchSessions = () => {
    setLoading(true);
    gql<{ mentorSessions: MentorshipSession[] }>(GET_MENTOR_SESSIONS, {}, token)
      .then((d) => setSessions(d.mentorSessions))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(fetchSessions, [token]);

  const handleAction = async (sessionId: string, action: 'accept' | 'decline') => {
    setActionLoading(sessionId + action);
    try {
      const mutation = action === 'accept' ? ACCEPT_SESSION : DECLINE_SESSION;
      await gql(mutation, { sessionId }, token);
      fetchSessions();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><CircularProgress /></div>;

  const pending = sessions.filter((s) => s.status === 'PENDING').length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">Session Requests</h1>
        <p className="text-gray-500 text-sm sm:text-base">
          Hello, <span className="font-semibold text-gray-700">{user?.firstName}</span>! Manage your mentorship requests below.
        </p>
      </div>

      {/* Pending badge */}
      {pending > 0 && (
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-2 rounded-xl mb-5 font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {pending} request{pending !== 1 ? 's' : ''} awaiting your response
        </div>
      )}

      {error && <Alert severity="error" className="mb-4" onClose={() => setError('')}>{error}</Alert>}

      {sessions.length === 0 ? (
        <div className="text-center py-16 sm:py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="text-5xl mb-4">📬</div>
          <p className="text-gray-700 font-semibold text-lg mb-1">No requests yet</p>
          <p className="text-gray-400 text-sm">When mentees request sessions, they'll appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:gap-4">
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`bg-white rounded-2xl shadow-sm border p-4 sm:p-6 transition-shadow hover:shadow-md ${
                s.status === 'PENDING' ? 'border-amber-200' : 'border-gray-100'
              }`}
            >
              {/* Card header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm shrink-0">
                    {s.mentee.firstName[0]}{s.mentee.lastName[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">
                      {s.mentee.firstName} {s.mentee.lastName}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{s.mentee.email}</p>
                    {s.scheduledAt && (
                      <p className="text-xs text-indigo-500 mt-0.5 font-medium">
                        📅 {new Date(s.scheduledAt).toLocaleDateString(undefined, {
                          weekday: 'short', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                </div>
                <Chip label={s.status} color={statusColor[s.status]} size="small" />
              </div>

              {/* Questions */}
              <p className="text-gray-600 text-sm bg-gray-50 rounded-xl p-3 leading-relaxed">{s.questions}</p>

              {/* Actions */}
              {s.status === 'PENDING' && (
                <div className={`flex gap-3 mt-4 ${isMobile ? 'flex-col' : ''}`}>
                  <Button
                    variant="contained"
                    size="small"
                    color="success"
                    fullWidth={isMobile}
                    onClick={() => handleAction(s.id, 'accept')}
                    disabled={actionLoading === s.id + 'accept'}
                    sx={{ textTransform: 'none', borderRadius: '8px', py: isMobile ? 1.2 : undefined }}
                  >
                    {actionLoading === s.id + 'accept' ? <CircularProgress size={16} color="inherit" /> : '✓ Accept'}
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    fullWidth={isMobile}
                    onClick={() => handleAction(s.id, 'decline')}
                    disabled={actionLoading === s.id + 'decline'}
                    sx={{ textTransform: 'none', borderRadius: '8px', py: isMobile ? 1.2 : undefined }}
                  >
                    {actionLoading === s.id + 'decline' ? <CircularProgress size={16} color="inherit" /> : '✕ Decline'}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

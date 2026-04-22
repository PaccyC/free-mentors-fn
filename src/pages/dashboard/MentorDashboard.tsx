import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { CircularProgress, Alert, Chip, Button } from '@mui/material';
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Session Requests</h1>
      <p className="text-gray-500 mb-6">Hello, {user?.firstName}! Manage your mentorship requests below.</p>

      {error && <Alert severity="error" className="mb-4">{error}</Alert>}

      {sessions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow">
          <p className="text-gray-400">No session requests yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {sessions.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-800">
                    {s.mentee.firstName} {s.mentee.lastName}
                  </p>
                  <p className="text-sm text-gray-400">{s.mentee.email}</p>
                  {s.scheduledAt && (
                    <p className="text-xs text-indigo-500 mt-1 font-medium">
                      Requested for: {new Date(s.scheduledAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <Chip label={s.status} color={statusColor[s.status]} size="small" />
              </div>
              <p className="text-gray-600 text-sm bg-gray-50 rounded-lg p-3">{s.questions}</p>
              {s.status === 'PENDING' && (
                <div className="flex gap-3 mt-4">
                  <Button
                    variant="contained"
                    size="small"
                    color="success"
                    onClick={() => handleAction(s.id, 'accept')}
                    disabled={actionLoading === s.id + 'accept'}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={() => handleAction(s.id, 'decline')}
                    disabled={actionLoading === s.id + 'decline'}
                  >
                    Decline
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

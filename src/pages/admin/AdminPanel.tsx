import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  CircularProgress, Alert, Button, Tab, Tabs, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { gql } from '../../api/client';
import { GET_ALL_USERS, GET_ALL_REVIEWS } from '../../api/queries';
import { CHANGE_USER_TO_MENTOR, HIDE_REVIEW } from '../../api/mutations';
import type { User, Review } from '../../types';
import type { RootState } from '../../store';

const roleColor: Record<string, 'default' | 'primary' | 'secondary'> = {
  USER: 'default',
  MENTOR: 'primary',
  ADMIN: 'secondary',
};

export default function AdminPanel() {
  const { token, user: currentUser } = useSelector((s: RootState) => s.auth);
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);

  const [users, setUsers] = useState<User[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      gql<{ allUsers: User[] }>(GET_ALL_USERS, {}, token),
      gql<{ allReviews: Review[] }>(GET_ALL_REVIEWS, {}, token),
    ])
      .then(([ud, rd]) => {
        setUsers(ud.allUsers);
        setReviews(rd.allReviews);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(fetchAll, [token]);

  const promoteToMentor = async (userId: string) => {
    setActionLoading(userId);
    try {
      await gql(CHANGE_USER_TO_MENTOR, { userId }, token);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: 'MENTOR' as const } : u)));
      if (selectedUser?.id === userId) {
        setSelectedUser((u) => u ? { ...u, role: 'MENTOR' } : u);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const hideReview = async (reviewId: string) => {
    setActionLoading(reviewId);
    try {
      await gql(HIDE_REVIEW, { reviewId }, token);
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, isHidden: true } : r)));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><CircularProgress /></div>;

  const visibleUsers = users.filter((u) => u.id !== currentUser?.id);
  const mentorCount = visibleUsers.filter((u) => u.role === 'MENTOR').length;
  const userCount = visibleUsers.filter((u) => u.role === 'USER').length;
  const hiddenReviews = reviews.filter((r) => r.isHidden).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Admin Panel</h1>
        <p className="text-gray-500 text-sm">Manage users, promote mentors, and moderate reviews.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users', value: userCount, color: 'bg-blue-50 text-blue-700' },
          { label: 'Mentors', value: mentorCount, color: 'bg-indigo-50 text-indigo-700' },
          { label: 'Total Reviews', value: reviews.length, color: 'bg-yellow-50 text-yellow-700' },
          { label: 'Hidden Reviews', value: hiddenReviews, color: 'bg-red-50 text-red-600' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.color} rounded-2xl p-4 text-center`}>
            <div className="text-3xl font-extrabold">{stat.value}</div>
            <div className="text-xs font-medium mt-1 opacity-80">{stat.label}</div>
          </div>
        ))}
      </div>

      {error && <Alert severity="error" className="mb-4" onClose={() => setError('')}>{error}</Alert>}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} className="mb-6">
        <Tab label={`Users (${visibleUsers.length})`} />
        <Tab label={`Reviews (${reviews.length})`} />
      </Tabs>

      {/* Users tab */}
      {tab === 0 && (
        <div className="flex flex-col gap-3">
          {visibleUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No users found.</div>
          ) : (
            visibleUsers.map((u) => (
              <div
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between cursor-pointer hover:shadow-md hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-base shrink-0">
                    {u.firstName[0]}{u.lastName[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{u.firstName} {u.lastName}</p>
                    <p className="text-sm text-gray-400">{u.email}</p>
                    {(u.occupation || u.expertise) && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {u.occupation}{u.expertise ? ` · ${u.expertise}` : ''}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Chip label={u.role} color={roleColor[u.role] || 'default'} size="small" />
                  {u.role === 'USER' && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={(e) => { e.stopPropagation(); promoteToMentor(u.id); }}
                      disabled={actionLoading === u.id}
                      sx={{ borderColor: '#4338ca', color: '#4338ca', fontSize: '0.7rem' }}
                    >
                      {actionLoading === u.id ? '…' : 'Make Mentor'}
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reviews tab */}
      {tab === 1 && (
        <div className="flex flex-col gap-3">
          {reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No reviews yet.</div>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className={`bg-white rounded-xl shadow-sm border p-5 transition ${r.isHidden ? 'border-red-100 opacity-60' : 'border-gray-100'}`}>
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-800 text-sm">
                      {r.mentee.firstName} {r.mentee.lastName}
                      <span className="text-gray-400 mx-2">→</span>
                      {r.mentor.firstName} {r.mentor.lastName}
                    </p>
                    <p className="text-yellow-500 text-sm mt-1">
                      {'★'.repeat(r.score)}{'☆'.repeat(5 - r.score)}
                      <span className="text-gray-400 ml-2 text-xs">{r.score}/5</span>
                    </p>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{r.comment}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    {r.isHidden ? (
                      <Chip label="Hidden" color="error" size="small" />
                    ) : (
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={() => hideReview(r.id)}
                        disabled={actionLoading === r.id}
                        sx={{ fontSize: '0.7rem' }}
                      >
                        {actionLoading === r.id ? '…' : 'Hide'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* User profile dialog */}
      <Dialog open={!!selectedUser} onClose={() => setSelectedUser(null)} maxWidth="sm" fullWidth>
        {selectedUser && (
          <>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg shrink-0">
                {selectedUser.firstName[0]}{selectedUser.lastName[0]}
              </div>
              <div>
                <p className="text-lg font-bold leading-tight">
                  {selectedUser.firstName} {selectedUser.lastName}
                </p>
                <Chip label={selectedUser.role} color={roleColor[selectedUser.role] || 'default'} size="small" />
              </div>
            </DialogTitle>

            <DialogContent dividers>
              <div className="flex flex-col gap-3 text-sm">
                <Row label="Email" value={selectedUser.email} />
                {selectedUser.occupation && <Row label="Occupation" value={selectedUser.occupation} />}
                {selectedUser.expertise && <Row label="Expertise" value={selectedUser.expertise} />}
                {selectedUser.address && <Row label="Address" value={selectedUser.address} />}
                {selectedUser.bio && (
                  <div>
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">Bio</p>
                    <p className="text-gray-700 leading-relaxed">{selectedUser.bio}</p>
                  </div>
                )}
              </div>
            </DialogContent>

            <DialogActions className="gap-2 p-4">
              {selectedUser.role === 'USER' && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => promoteToMentor(selectedUser.id)}
                  disabled={actionLoading === selectedUser.id}
                  sx={{ backgroundColor: '#4338ca', '&:hover': { backgroundColor: '#3730a3' } }}
                >
                  Make Mentor
                </Button>
              )}
              {selectedUser.role === 'MENTOR' && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => { setSelectedUser(null); navigate(`/mentors/${selectedUser.id}`); }}
                >
                  View Public Profile
                </Button>
              )}
              <Button onClick={() => setSelectedUser(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-gray-400 font-medium w-24 shrink-0">{label}</span>
      <span className="text-gray-700">{value}</span>
    </div>
  );
}

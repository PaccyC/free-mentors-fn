import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  CircularProgress, Alert, Button, Tab, Tabs, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, useMediaQuery,
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
  const isMobile = useMediaQuery('(max-width:600px)');
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
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">Admin Panel</h1>
        <p className="text-gray-500 text-sm">Manage users, promote mentors, and moderate reviews.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {[
          { label: 'Users', value: userCount, icon: '👤', color: 'bg-blue-50 text-blue-700 border-blue-100' },
          { label: 'Mentors', value: mentorCount, icon: '🎓', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
          { label: 'Reviews', value: reviews.length, icon: '⭐', color: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
          { label: 'Hidden', value: hiddenReviews, icon: '🚫', color: 'bg-red-50 text-red-600 border-red-100' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.color} border rounded-2xl p-4 text-center`}>
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl sm:text-3xl font-extrabold">{stat.value}</div>
            <div className="text-xs font-medium mt-0.5 opacity-80">{stat.label}</div>
          </div>
        ))}
      </div>

      {error && <Alert severity="error" className="mb-4" onClose={() => setError('')}>{error}</Alert>}

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        className="mb-5"
        variant={isMobile ? 'fullWidth' : 'standard'}
      >
        <Tab label={`Users (${visibleUsers.length})`} sx={{ textTransform: 'none', fontWeight: 600 }} />
        <Tab label={`Reviews (${reviews.length})`} sx={{ textTransform: 'none', fontWeight: 600 }} />
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
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 cursor-pointer hover:shadow-md hover:bg-gray-50 transition"
              >
                {/* Mobile: stacked; Desktop: row */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                    {u.firstName[0]}{u.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <p className="font-semibold text-gray-800 text-sm">{u.firstName} {u.lastName}</p>
                      <Chip label={u.role} color={roleColor[u.role] || 'default'} size="small" />
                    </div>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    {(u.occupation || u.expertise) && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {u.occupation}{u.expertise ? ` · ${u.expertise}` : ''}
                      </p>
                    )}
                  </div>
                  {u.role === 'USER' && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={(e) => { e.stopPropagation(); promoteToMentor(u.id); }}
                      disabled={actionLoading === u.id}
                      sx={{ borderColor: '#4338ca', color: '#4338ca', fontSize: '0.7rem', textTransform: 'none', shrink: 0, whiteSpace: 'nowrap' }}
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
              <div
                key={r.id}
                className={`bg-white rounded-xl shadow-sm border p-4 sm:p-5 transition ${
                  r.isHidden ? 'border-red-100 opacity-60' : 'border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">
                      <span className="text-gray-600">{r.mentee.firstName} {r.mentee.lastName}</span>
                      <span className="text-gray-400 mx-1.5">→</span>
                      <span className="text-gray-700">{r.mentor.firstName} {r.mentor.lastName}</span>
                    </p>
                    <p className="text-yellow-500 text-sm mt-1">
                      {'★'.repeat(r.score)}{'☆'.repeat(5 - r.score)}
                      <span className="text-gray-400 ml-1.5 text-xs">{r.score}/5</span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1.5 line-clamp-2 leading-relaxed">{r.comment}</p>
                  </div>
                  <div className="shrink-0">
                    {r.isHidden ? (
                      <Chip label="Hidden" color="error" size="small" />
                    ) : (
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={() => hideReview(r.id)}
                        disabled={actionLoading === r.id}
                        sx={{ fontSize: '0.7rem', textTransform: 'none' }}
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
      <Dialog
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        {selectedUser && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg shrink-0">
                  {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                </div>
                <div>
                  <p className="text-base font-bold leading-tight">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </p>
                  <Chip label={selectedUser.role} color={roleColor[selectedUser.role] || 'default'} size="small" />
                </div>
              </div>
            </DialogTitle>

            <DialogContent dividers>
              <div className="flex flex-col gap-3 text-sm">
                <InfoRow label="Email" value={selectedUser.email} />
                {selectedUser.occupation && <InfoRow label="Occupation" value={selectedUser.occupation} />}
                {selectedUser.expertise && <InfoRow label="Expertise" value={selectedUser.expertise} />}
                {selectedUser.address && <InfoRow label="Address" value={selectedUser.address} />}
                {selectedUser.bio && (
                  <div>
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1">Bio</p>
                    <p className="text-gray-700 leading-relaxed text-sm">{selectedUser.bio}</p>
                  </div>
                )}
              </div>
            </DialogContent>

            <DialogActions sx={{ p: 2, gap: 1, flexWrap: 'wrap' }}>
              {selectedUser.role === 'USER' && (
                <Button
                  variant="contained"
                  size="small"
                  fullWidth={isMobile}
                  onClick={() => promoteToMentor(selectedUser.id)}
                  disabled={actionLoading === selectedUser.id}
                  sx={{
                    backgroundColor: '#4338ca',
                    '&:hover': { backgroundColor: '#3730a3' },
                    textTransform: 'none',
                  }}
                >
                  Make Mentor
                </Button>
              )}
              {selectedUser.role === 'MENTOR' && (
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth={isMobile}
                  onClick={() => { setSelectedUser(null); navigate(`/mentors/${selectedUser.id}`); }}
                  sx={{ textTransform: 'none' }}
                >
                  View Public Profile
                </Button>
              )}
              <Button
                onClick={() => setSelectedUser(null)}
                fullWidth={isMobile}
                sx={{ textTransform: 'none' }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-gray-400 font-medium w-20 sm:w-24 shrink-0 text-xs uppercase tracking-wide pt-0.5">
        {label}
      </span>
      <span className="text-gray-700 flex-1 wrap-break-word">{value}</span>
    </div>
  );
}

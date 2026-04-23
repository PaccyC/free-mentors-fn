import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  CircularProgress, Alert, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Rating, useMediaQuery,
} from '@mui/material';
import { gql } from '../../api/client';
import { GET_MENTOR, GET_MENTOR_REVIEWS } from '../../api/queries';
import { CREATE_SESSION, REVIEW_MENTOR } from '../../api/mutations';
import type { User, Review } from '../../types';
import type { RootState } from '../../store';

export default function MentorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, user } = useSelector((s: RootState) => s.auth);
  const isMobile = useMediaQuery('(max-width:600px)');

  const [mentor, setMentor] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [sessionOpen, setSessionOpen] = useState(false);
  const [questions, setQuestions] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionError, setSessionError] = useState('');

  const [reviewOpen, setReviewOpen] = useState(false);
  const [score, setScore] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      gql<{ mentor: User }>(GET_MENTOR, { id }),
      gql<{ mentorReviews: Review[] }>(GET_MENTOR_REVIEWS, { mentorId: id }),
    ])
      .then(([md, rd]) => {
        setMentor(md.mentor);
        setReviews(rd.mentorReviews);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRequestSession = async () => {
    if (!token) { navigate('/login'); return; }
    if (!scheduledAt) { setSessionError('Please select a date and time.'); return; }
    setSessionError('');
    setSessionLoading(true);
    try {
      await gql(CREATE_SESSION, { mentorId: id, questions, scheduledAt: new Date(scheduledAt).toISOString() }, token);
      setSessionOpen(false);
      setQuestions('');
      setScheduledAt('');
      navigate('/dashboard');
    } catch (e: unknown) {
      setSessionError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setSessionLoading(false);
    }
  };

  const handleReview = async () => {
    setReviewError('');
    setReviewLoading(true);
    try {
      await gql(REVIEW_MENTOR, { mentorId: id, score, comment }, token);
      setReviewOpen(false);
      setReviewSuccess(true);
      const rd = await gql<{ mentorReviews: Review[] }>(GET_MENTOR_REVIEWS, { mentorId: id });
      setReviews(rd.mentorReviews);
    } catch (e: unknown) {
      setReviewError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><CircularProgress /></div>;
  if (error || !mentor) return <div className="p-4 sm:p-8"><Alert severity="error">{error || 'Mentor not found'}</Alert></div>;

  const avgScore = reviews.length
    ? (reviews.reduce((s, r) => s + r.score, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8 mb-6 sm:mb-8">
        {/* Avatar + info: side-by-side on mobile, same on larger */}
        <div className="flex items-start gap-4 sm:gap-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl sm:text-2xl shrink-0">
            {mentor.firstName[0]}{mentor.lastName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 leading-tight">
              {mentor.firstName} {mentor.lastName}
            </h1>
            <p className="text-indigo-600 font-medium text-sm sm:text-base mt-0.5">{mentor.occupation}</p>

            {mentor.expertise && (
              <div className="flex flex-wrap gap-1 mt-2">
                {mentor.expertise.split(',').slice(0, 4).map((t) => t.trim()).filter(Boolean).map((tag) => (
                  <span key={tag} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {mentor.address && (
              <p className="text-xs sm:text-sm text-gray-400 mt-1.5 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {mentor.address}
              </p>
            )}

            {avgScore && (
              <div className="flex items-center gap-1.5 mt-2">
                <Rating value={parseFloat(avgScore)} precision={0.1} readOnly size="small" />
                <span className="text-sm text-gray-500">
                  {avgScore} <span className="text-gray-400">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {mentor.bio && (
          <p className="mt-4 sm:mt-5 text-gray-600 text-sm sm:text-base leading-relaxed border-t border-gray-100 pt-4">
            {mentor.bio}
          </p>
        )}

        {/* Action buttons */}
        {token && user?.role !== 'ADMIN' && user?.id !== id && (
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <Button
              variant="contained"
              fullWidth={isMobile}
              onClick={() => setSessionOpen(true)}
              sx={{
                backgroundColor: '#4338ca',
                '&:hover': { backgroundColor: '#3730a3' },
                textTransform: 'none',
                borderRadius: '10px',
                py: 1.2,
              }}
            >
              Request Session
            </Button>
            {user?.role === 'USER' && (
              <Button
                variant="outlined"
                fullWidth={isMobile}
                onClick={() => setReviewOpen(true)}
                sx={{ textTransform: 'none', borderRadius: '10px', py: 1.2 }}
              >
                Leave a Review
              </Button>
            )}
          </div>
        )}

        {reviewSuccess && <Alert severity="success" className="mt-4">Review submitted!</Alert>}

        {!token && (
          <p className="mt-4 text-sm text-gray-500 bg-gray-50 rounded-xl p-3">
            <button onClick={() => navigate('/login')} className="text-indigo-600 font-semibold hover:underline">
              Sign in
            </button>{' '}
            to request a mentorship session.
          </p>
        )}
      </div>

      {/* Reviews */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
          Reviews <span className="text-gray-400 font-normal">({reviews.length})</span>
        </h2>

        {reviews.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
            <div className="text-3xl mb-2">⭐</div>
            <p className="text-gray-400 text-sm">No reviews yet. Be the first!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:gap-4">
            {reviews.map((r) => (
              <div key={r.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <span className="font-semibold text-gray-800 text-sm">
                    {r.mentee.firstName} {r.mentee.lastName}
                  </span>
                  <Rating value={r.score} readOnly size="small" />
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Session Dialog */}
      <Dialog
        open={sessionOpen}
        onClose={() => setSessionOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Request a Mentorship Session</DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-4 pt-2">
            {sessionError && <Alert severity="error">{sessionError}</Alert>}
            <TextField
              label="Preferred date & time"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              fullWidth
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { min: new Date().toISOString().slice(0, 16) },
              }}
            />
            <TextField
              label="What would you like to discuss?"
              multiline
              rows={isMobile ? 5 : 4}
              value={questions}
              onChange={(e) => setQuestions(e.target.value)}
              fullWidth
              placeholder="Share your goals, questions, or topics you'd like to cover..."
            />
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setSessionOpen(false)}
            sx={{ textTransform: 'none', flex: isMobile ? 1 : undefined }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRequestSession}
            variant="contained"
            disabled={!questions.trim() || !scheduledAt || sessionLoading}
            sx={{
              backgroundColor: '#4338ca',
              textTransform: 'none',
              flex: isMobile ? 1 : undefined,
            }}
          >
            {sessionLoading ? <CircularProgress size={18} color="inherit" /> : 'Send Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Review Dialog */}
      <Dialog
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Review {mentor.firstName}</DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-4 pt-2">
            {reviewError && <Alert severity="error">{reviewError}</Alert>}
            <div>
              <p className="text-sm text-gray-600 mb-2 font-medium">Your rating</p>
              <Rating
                value={score}
                onChange={(_, v) => setScore(v || 1)}
                size={isMobile ? 'large' : 'medium'}
              />
            </div>
            <TextField
              label="Your comment"
              multiline
              rows={isMobile ? 5 : 3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              fullWidth
              placeholder="Share your experience with this mentor..."
            />
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setReviewOpen(false)}
            sx={{ textTransform: 'none', flex: isMobile ? 1 : undefined }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReview}
            variant="contained"
            disabled={!comment.trim() || reviewLoading}
            sx={{
              backgroundColor: '#4338ca',
              textTransform: 'none',
              flex: isMobile ? 1 : undefined,
            }}
          >
            {reviewLoading ? <CircularProgress size={18} color="inherit" /> : 'Submit Review'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

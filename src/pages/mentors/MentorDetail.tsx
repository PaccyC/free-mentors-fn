import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  CircularProgress, Alert, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Rating
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
  if (error || !mentor) return <div className="p-8"><Alert severity="error">{error || 'Mentor not found'}</Alert></div>;

  const avgScore = reviews.length
    ? (reviews.reduce((s, r) => s + r.score, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow p-8 mb-8">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl shrink-0">
            {mentor.firstName[0]}{mentor.lastName[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">
              {mentor.firstName} {mentor.lastName}
            </h1>
            <p className="text-indigo-600 font-medium">{mentor.occupation}</p>
            <p className="text-sm text-gray-500 mt-1">
              Expertise: <span className="text-gray-700 font-medium">{mentor.expertise}</span>
            </p>
            {mentor.address && (
              <p className="text-sm text-gray-400 mt-1">{mentor.address}</p>
            )}
            {avgScore && (
              <div className="flex items-center gap-1 mt-2">
                <Rating value={parseFloat(avgScore)} precision={0.1} readOnly size="small" />
                <span className="text-sm text-gray-500">{avgScore} ({reviews.length} reviews)</span>
              </div>
            )}
          </div>
        </div>
        {mentor.bio && (
          <p className="mt-5 text-gray-600 leading-relaxed">{mentor.bio}</p>
        )}

        {token && user?.role !== 'ADMIN' && user?.id !== id && (
          <div className="mt-6 flex gap-3">
            <Button
              variant="contained"
              onClick={() => setSessionOpen(true)}
              sx={{ backgroundColor: '#4338ca', '&:hover': { backgroundColor: '#3730a3' } }}
            >
              Request Mentorship Session
            </Button>
            {user?.role === 'USER' && (
              <Button variant="outlined" onClick={() => setReviewOpen(true)}>
                Leave a Review
              </Button>
            )}
          </div>
        )}
        {reviewSuccess && <Alert severity="success" className="mt-4">Review submitted!</Alert>}
        {!token && (
          <p className="mt-4 text-sm text-gray-500">
            <button onClick={() => navigate('/login')} className="text-indigo-600 hover:underline">
              Sign in
            </button>{' '}
            to request a session.
          </p>
        )}
      </div>

      {/* Reviews */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Reviews ({reviews.length})
        </h2>
        {reviews.length === 0 ? (
          <p className="text-gray-400">No reviews yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {reviews.map((r) => (
              <div key={r.id} className="bg-white rounded-xl shadow p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">
                    {r.mentee.firstName} {r.mentee.lastName}
                  </span>
                  <Rating value={r.score} readOnly size="small" />
                </div>
                <p className="text-gray-600 text-sm">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Session Dialog */}
      <Dialog open={sessionOpen} onClose={() => setSessionOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request a Mentorship Session</DialogTitle>
        <DialogContent className="flex flex-col gap-4 pt-2">
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
            rows={4}
            value={questions}
            onChange={(e) => setQuestions(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSessionOpen(false)}>Cancel</Button>
          <Button
            onClick={handleRequestSession}
            variant="contained"
            disabled={!questions.trim() || !scheduledAt || sessionLoading}
            sx={{ backgroundColor: '#4338ca' }}
          >
            {sessionLoading ? <CircularProgress size={18} color="inherit" /> : 'Send Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewOpen} onClose={() => setReviewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Review {mentor.firstName}</DialogTitle>
        <DialogContent className="flex flex-col gap-3 pt-2">
          {reviewError && <Alert severity="error">{reviewError}</Alert>}
          <div>
            <p className="text-sm text-gray-600 mb-1">Rating</p>
            <Rating value={score} onChange={(_, v) => setScore(v || 1)} />
          </div>
          <TextField
            label="Your comment"
            multiline
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewOpen(false)}>Cancel</Button>
          <Button
            onClick={handleReview}
            variant="contained"
            disabled={!comment.trim() || reviewLoading}
            sx={{ backgroundColor: '#4338ca' }}
          >
            {reviewLoading ? <CircularProgress size={18} color="inherit" /> : 'Submit Review'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

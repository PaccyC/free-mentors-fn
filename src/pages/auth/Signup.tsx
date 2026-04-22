import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { TextField, Button, Alert, CircularProgress, Grid } from '@mui/material';
import { gql } from '../../api/client';
import { SIGNUP } from '../../api/mutations';
import { setAuth } from '../../store/authSlice';
import type { AuthPayload } from '../../types';

interface SignupForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  bio: string;
  address: string;
  occupation: string;
  expertise: string;
  [key: string]: string;
}

const initial: SignupForm = {
  firstName: '', lastName: '', email: '', password: '',
  bio: '', address: '', occupation: '', expertise: '',
};

export default function Signup() {
  const [form, setForm] = useState<SignupForm>(initial);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const set = (k: keyof SignupForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await gql<{ signup: AuthPayload }>(SIGNUP, form);
      dispatch(setAuth(data.signup));
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const field = (label: string, k: keyof SignupForm, type = 'text', required = false) => (
    <TextField
      label={label}
      type={type}
      value={form[k]}
      onChange={set(k)}
      required={required}
      fullWidth
      size="small"
    />
  );

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Create an account</h1>
        <p className="text-gray-500 text-sm mb-6">Join FreeMentors today — it's free</p>

        {error && <Alert severity="error" className="mb-4">{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid size={6}>{field('First Name', 'firstName', 'text', true)}</Grid>
            <Grid size={6}>{field('Last Name', 'lastName', 'text', true)}</Grid>
            <Grid size={12}>{field('Email', 'email', 'email', true)}</Grid>
            <Grid size={12}>{field('Password', 'password', 'password', true)}</Grid>
            <Grid size={12}>{field('Occupation', 'occupation')}</Grid>
            <Grid size={12}>{field('Area of Expertise', 'expertise')}</Grid>
            <Grid size={12}>{field('Address', 'address')}</Grid>
            <Grid size={12}>
              <TextField
                label="Bio"
                value={form.bio}
                onChange={set('bio')}
                fullWidth
                size="small"
                multiline
                rows={3}
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{ backgroundColor: '#4338ca', '&:hover': { backgroundColor: '#3730a3' }, py: 1.2, mt: 2 }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { TextField, Button, Alert, CircularProgress, Grid, InputAdornment, IconButton } from '@mui/material';
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

const inputSx = { '& input': { fontSize: '1rem' } };

function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

export default function Signup() {
  const [form, setForm] = useState<SignupForm>(initial);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const set = (k: keyof SignupForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (form.password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
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

  const passwordsMatch = confirmPassword === '' || form.password === confirmPassword;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🎓</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">Create an account</h1>
          <p className="text-gray-500 text-sm">Join FreeMentors today — it's free</p>
        </div>

        {error && (
          <Alert severity="error" className="mb-4" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid size={6}>
              <TextField label="First Name" type="text" value={form.firstName} onChange={set('firstName')} required fullWidth autoComplete="given-name" sx={inputSx} />
            </Grid>
            <Grid size={6}>
              <TextField label="Last Name" type="text" value={form.lastName} onChange={set('lastName')} required fullWidth autoComplete="family-name" sx={inputSx} />
            </Grid>
            <Grid size={12}>
              <TextField label="Email" type="email" value={form.email} onChange={set('email')} required fullWidth autoComplete="email" sx={inputSx} />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                required
                fullWidth
                autoComplete="new-password"
                sx={inputSx}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword((s) => !s)} edge="end" size="small">
                          <EyeIcon visible={showPassword} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Confirm Password"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                fullWidth
                autoComplete="new-password"
                error={!passwordsMatch}
                helperText={!passwordsMatch ? 'Passwords do not match' : ''}
                sx={inputSx}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirm((s) => !s)} edge="end" size="small">
                          <EyeIcon visible={showConfirm} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>

            <Grid size={12}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Profile info (optional)
              </p>
            </Grid>
            <Grid size={12}>
              <TextField label="Occupation" value={form.occupation} onChange={set('occupation')} fullWidth sx={inputSx} />
            </Grid>
            <Grid size={12}>
              <TextField label="Area of Expertise" value={form.expertise} onChange={set('expertise')} fullWidth sx={inputSx} />
            </Grid>
            <Grid size={12}>
              <TextField label="City / Address" value={form.address} onChange={set('address')} fullWidth autoComplete="address-level2" sx={inputSx} />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Bio"
                value={form.bio}
                onChange={set('bio')}
                fullWidth
                multiline
                rows={3}
                sx={{ '& textarea': { fontSize: '1rem' } }}
                placeholder="Tell mentors a bit about yourself..."
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading || !passwordsMatch}
            sx={{
              backgroundColor: '#4338ca',
              '&:hover': { backgroundColor: '#3730a3' },
              py: 1.5,
              fontSize: '1rem',
              textTransform: 'none',
              borderRadius: '12px',
              mt: 2,
            }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

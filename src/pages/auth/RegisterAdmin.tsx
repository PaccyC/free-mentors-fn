import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TextField, Button, Alert, CircularProgress, Grid,
  InputAdornment, IconButton,
} from '@mui/material';
import { gql } from '../../api/client';
import { CREATE_ADMIN } from '../../api/mutations';
import type { User } from '../../types';

interface Form {
  adminCreationKey: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  occupation: string;
  expertise: string;
  [key: string]: string;
}

const initial: Form = {
  adminCreationKey: '',
  firstName: '', lastName: '',
  email: '', password: '',
  occupation: '', expertise: '',
};

const inputSx = { '& input': { fontSize: '1rem' } };

export default function RegisterAdmin() {
  const navigate = useNavigate();
  const [form, setForm] = useState<Form>(initial);
  const [showKey, setShowKey] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await gql<{ createAdmin: User }>(CREATE_ADMIN, form);
      navigate('/login', { state: { message: 'Admin account created. You can now sign in.' } });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create admin account');
    } finally {
      setLoading(false);
    }
  };

  const eyeIcon = (visible: boolean) => visible ? (
    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🔐</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">Create Admin Account</h1>
          <p className="text-gray-500 text-sm">Requires the admin creation key to proceed</p>
        </div>

        {error && (
          <Alert severity="error" className="mb-4" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Admin creation key */}
            <Grid size={12}>
              <TextField
                label="Admin Creation Key"
                type={showKey ? 'text' : 'password'}
                value={form.adminCreationKey}
                onChange={set('adminCreationKey')}
                required
                fullWidth
                sx={inputSx}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowKey((s) => !s)} edge="end" size="small">
                          {eyeIcon(showKey)}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>

            <Grid size={12}>
              <div className="border-t border-gray-100 pt-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0">
                  Account details
                </p>
              </div>
            </Grid>

            <Grid size={6}>
              <TextField label="First Name" value={form.firstName} onChange={set('firstName')} required fullWidth sx={inputSx} />
            </Grid>
            <Grid size={6}>
              <TextField label="Last Name" value={form.lastName} onChange={set('lastName')} required fullWidth sx={inputSx} />
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
                          {eyeIcon(showPassword)}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>

            <Grid size={12}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Profile (optional)
              </p>
            </Grid>
            <Grid size={12}>
              <TextField label="Occupation" value={form.occupation} onChange={set('occupation')} fullWidth sx={inputSx} />
            </Grid>
            <Grid size={12}>
              <TextField label="Expertise" value={form.expertise} onChange={set('expertise')} fullWidth sx={inputSx} />
            </Grid>
          </Grid>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              backgroundColor: '#4338ca',
              '&:hover': { backgroundColor: '#3730a3' },
              py: 1.5,
              fontSize: '1rem',
              textTransform: 'none',
              borderRadius: '12px',
              mt: 2,
              cursor: 'pointer',
            }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Create Admin Account'}
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

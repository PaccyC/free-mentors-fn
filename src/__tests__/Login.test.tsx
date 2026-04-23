import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../pages/auth/Login';
import { renderWithProviders } from './testUtils';
import { gql } from '../api/client';

const mockGql = gql as jest.Mock;

const mockAuthPayload = {
  token: 'jwt-token',
  user: {
    id: '1', firstName: 'Alice', lastName: 'Smith', email: 'alice@test.com',
    bio: '', address: '', occupation: 'Dev', expertise: 'React', role: 'USER',
  },
};

describe('Login page', () => {
  beforeEach(() => {
    mockGql.mockReset();
  });

  it('renders email and password fields', () => {
    renderWithProviders(<Login />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders the Sign In button', () => {
    renderWithProviders(<Login />);
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders a link to sign up', () => {
    renderWithProviders(<Login />);
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
  });

  it('calls gql with email and password on submit', async () => {
    mockGql.mockResolvedValueOnce({ login: mockAuthPayload });
    renderWithProviders(<Login />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'alice@test.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'secret123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockGql).toHaveBeenCalledTimes(1);
      const [, variables] = mockGql.mock.calls[0];
      expect(variables).toMatchObject({ email: 'alice@test.com', password: 'secret123' });
    });
  });

  it('stores auth in Redux store after successful login', async () => {
    mockGql.mockResolvedValueOnce({ login: mockAuthPayload });
    const { store } = renderWithProviders(<Login />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'alice@test.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'secret123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      const authState = store.getState().auth;
      expect(authState.token).toBe('jwt-token');
      expect(authState.user?.email).toBe('alice@test.com');
    });
  });

  it('shows error message on failed login', async () => {
    mockGql.mockRejectedValueOnce(new Error('Invalid credentials'));
    renderWithProviders(<Login />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'wrong@test.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});

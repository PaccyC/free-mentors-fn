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

  // Helper: MUI textbox role for email; direct querySelector for type="password"
  const setup = () => {
    const result = renderWithProviders(<Login />);
    const emailInput = result.container.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = result.container.querySelector('input[type="password"], input[autocomplete="current-password"]') as HTMLInputElement;
    return { ...result, emailInput, passwordInput };
  };

  it('renders email and password fields', () => {
    const { emailInput, passwordInput } = setup();
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
  });

  it('renders the Sign In button', () => {
    renderWithProviders(<Login />);
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders a link to sign up', () => {
    renderWithProviders(<Login />);
    expect(screen.getByText(/create one free/i)).toBeInTheDocument();
  });

  it('renders show/hide password toggle', () => {
    renderWithProviders(<Login />);
    expect(screen.getByLabelText('Show password')).toBeInTheDocument();
  });

  it('toggles password visibility on button click', () => {
    const { passwordInput } = setup();
    expect(passwordInput).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByLabelText('Show password'));
    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('calls gql with email and password on submit', async () => {
    mockGql.mockResolvedValueOnce({ login: mockAuthPayload });
    const { emailInput, passwordInput } = setup();

    fireEvent.change(emailInput, { target: { value: 'alice@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockGql).toHaveBeenCalledTimes(1);
      const [, variables] = mockGql.mock.calls[0];
      expect(variables).toMatchObject({ email: 'alice@test.com', password: 'secret123' });
    });
  });

  it('stores auth in Redux store after successful login', async () => {
    mockGql.mockResolvedValueOnce({ login: mockAuthPayload });
    const { store, emailInput, passwordInput } = setup();

    fireEvent.change(emailInput, { target: { value: 'alice@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      const authState = store.getState().auth;
      expect(authState.token).toBe('jwt-token');
      expect(authState.user?.email).toBe('alice@test.com');
    });
  });

  it('shows error message on failed login', async () => {
    mockGql.mockRejectedValueOnce(new Error('Invalid credentials'));
    const { emailInput, passwordInput } = setup();

    fireEvent.change(emailInput, { target: { value: 'wrong@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});

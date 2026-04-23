import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import Signup from '../pages/auth/Signup';
import { renderWithProviders } from './testUtils';
import { gql } from '../api/client';

const mockGql = gql as jest.Mock;

const mockAuthPayload = {
  token: 'jwt-token',
  user: {
    id: '2', firstName: 'Bob', lastName: 'Jones', email: 'bob@test.com',
    bio: '', address: '', occupation: 'Designer', expertise: 'UI', role: 'USER',
  },
};

describe('Signup page', () => {
  beforeEach(() => {
    mockGql.mockReset();
  });

  it('renders all required fields', () => {
    renderWithProviders(<Signup />);
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders optional profile fields', () => {
    renderWithProviders(<Signup />);
    expect(screen.getByLabelText(/occupation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/area of expertise/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bio/i)).toBeInTheDocument();
  });

  it('renders the Create Account button', () => {
    renderWithProviders(<Signup />);
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('calls gql with form data on submit', async () => {
    mockGql.mockResolvedValueOnce({ signup: mockAuthPayload });
    renderWithProviders(<Signup />);

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Bob' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Jones' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'bob@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass1234' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockGql).toHaveBeenCalledTimes(1);
      const [, variables] = mockGql.mock.calls[0];
      expect(variables).toMatchObject({
        firstName: 'Bob',
        lastName: 'Jones',
        email: 'bob@test.com',
        password: 'pass1234',
      });
    });
  });

  it('stores auth in Redux store after successful signup', async () => {
    mockGql.mockResolvedValueOnce({ signup: mockAuthPayload });
    const { store } = renderWithProviders(<Signup />);

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Bob' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Jones' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'bob@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass1234' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      const authState = store.getState().auth;
      expect(authState.token).toBe('jwt-token');
      expect(authState.user?.firstName).toBe('Bob');
    });
  });

  it('shows error message on failed signup', async () => {
    mockGql.mockRejectedValueOnce(new Error('Email already registered'));
    renderWithProviders(<Signup />);

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Bob' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Jones' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'bob@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass1234' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText('Email already registered')).toBeInTheDocument();
    });
  });

  it('renders a link to sign in', () => {
    renderWithProviders(<Signup />);
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });
});

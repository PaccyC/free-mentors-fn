import React from 'react';
import { screen } from '@testing-library/react';
import ProtectedRoute from '../components/ProtectedRoute';
import { renderWithProviders } from './testUtils';
import type { User } from '../types';

const userAuth: User = {
  id: '1', firstName: 'Jane', lastName: 'Doe', email: 'jane@test.com',
  bio: '', address: '', occupation: '', expertise: '', role: 'USER',
};

const adminAuth: User = { ...userAuth, role: 'ADMIN' };

describe('ProtectedRoute', () => {
  it('renders children when authenticated with matching role', () => {
    renderWithProviders(
      <ProtectedRoute roles={['USER']}>
        <div>Protected Content</div>
      </ProtectedRoute>,
      { preloadedState: { auth: { token: 'test-token', user: userAuth } } }
    );
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to /login when no token', () => {
    renderWithProviders(
      <ProtectedRoute roles={['USER']}>
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('does not render children when role does not match', () => {
    renderWithProviders(
      <ProtectedRoute roles={['ADMIN']}>
        <div>Admin Content</div>
      </ProtectedRoute>,
      { preloadedState: { auth: { token: 'test-token', user: userAuth } } }
    );
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('renders children when user has ADMIN role and route allows ADMIN', () => {
    renderWithProviders(
      <ProtectedRoute roles={['ADMIN']}>
        <div>Admin Content</div>
      </ProtectedRoute>,
      { preloadedState: { auth: { token: 'test-token', user: adminAuth } } }
    );
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('renders children when no roles restriction is set', () => {
    renderWithProviders(
      <ProtectedRoute>
        <div>Open Protected</div>
      </ProtectedRoute>,
      { preloadedState: { auth: { token: 'test-token', user: userAuth } } }
    );
    expect(screen.getByText('Open Protected')).toBeInTheDocument();
  });
});

import React from 'react';
import { screen } from '@testing-library/react';
import Landing from '../pages/Landing';
import { renderWithProviders } from './testUtils';
import type { User } from '../types';

const mockUser: User = {
  id: '1', firstName: 'Bob', lastName: 'Smith', email: 'bob@test.com',
  bio: '', address: '', occupation: '', expertise: '', role: 'USER',
};

describe('Landing page', () => {
  it('renders the hero heading', () => {
    renderWithProviders(<Landing />);
    expect(screen.getByText(/Connect with Expert Mentors/i)).toBeInTheDocument();
  });

  it('shows Get Started Free and Browse Mentors for unauthenticated users', () => {
    renderWithProviders(<Landing />);
    expect(screen.getByText('Get Started Free')).toBeInTheDocument();
    expect(screen.getByText('Browse Mentors')).toBeInTheDocument();
  });

  it('shows only Browse Mentors → for authenticated users', () => {
    renderWithProviders(<Landing />, {
      preloadedState: { auth: { token: 'test-token', user: mockUser } },
    });
    expect(screen.getByText('Browse Mentors →')).toBeInTheDocument();
    expect(screen.queryByText('Get Started Free')).not.toBeInTheDocument();
  });

  it('renders the How It Works section with 3 steps', () => {
    renderWithProviders(<Landing />);
    expect(screen.getByText('How It Works')).toBeInTheDocument();
    expect(screen.getByText('Create an Account')).toBeInTheDocument();
    expect(screen.getByText('Find a Mentor')).toBeInTheDocument();
    expect(screen.getByText('Request a Session')).toBeInTheDocument();
  });

  it('renders the stats bar', () => {
    renderWithProviders(<Landing />);
    expect(screen.getByText('Mentors')).toBeInTheDocument();
    expect(screen.getByText('Sessions')).toBeInTheDocument();
  });

  it('renders the testimonials section', () => {
    renderWithProviders(<Landing />);
    expect(screen.getByText('What People Say')).toBeInTheDocument();
  });

  it('shows bottom CTA for unauthenticated users', () => {
    renderWithProviders(<Landing />);
    expect(screen.getByText('Create a Free Account')).toBeInTheDocument();
  });

  it('hides bottom CTA for authenticated users', () => {
    renderWithProviders(<Landing />, {
      preloadedState: { auth: { token: 'test-token', user: mockUser } },
    });
    expect(screen.queryByText('Create a Free Account')).not.toBeInTheDocument();
  });
});

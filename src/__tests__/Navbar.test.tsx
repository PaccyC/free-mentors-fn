import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import Navbar from '../components/Navbar';
import { renderWithProviders } from './testUtils';
import type { User } from '../types';

const mockUser: User = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  bio: '', address: '', occupation: 'Engineer', expertise: 'React',
  role: 'USER',
};

const adminUser: User = { ...mockUser, role: 'ADMIN', firstName: 'Admin' };
const mentorUser: User = { ...mockUser, role: 'MENTOR', firstName: 'Mentor' };

describe('Navbar', () => {
  it('renders the brand logo', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByText('FreeMentors')).toBeInTheDocument();
  });

  it('shows Find Mentors link', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getAllByText('Find Mentors')[0]).toBeInTheDocument();
  });

  it('shows Sign In and Get Started when unauthenticated', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('shows user name and Logout when authenticated', () => {
    renderWithProviders(<Navbar />, {
      preloadedState: { auth: { token: 'test-token', user: mockUser } },
    });
    expect(screen.getByText(/John/)).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('hides Sign In and Sign Up when authenticated', () => {
    renderWithProviders(<Navbar />, {
      preloadedState: { auth: { token: 'test-token', user: mockUser } },
    });
    expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
    expect(screen.queryByText('Get Started')).not.toBeInTheDocument();
  });

  it('shows Admin Panel link for ADMIN role', () => {
    renderWithProviders(<Navbar />, {
      preloadedState: { auth: { token: 'test-token', user: adminUser } },
    });
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });

  it('does not show Admin Panel link for USER role', () => {
    renderWithProviders(<Navbar />, {
      preloadedState: { auth: { token: 'test-token', user: mockUser } },
    });
    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
  });

  it('shows My Sessions link for authenticated users', () => {
    renderWithProviders(<Navbar />, {
      preloadedState: { auth: { token: 'test-token', user: mockUser } },
    });
    expect(screen.getByText('My Sessions')).toBeInTheDocument();
  });

  it('shows MENTOR role badge when user is a mentor', () => {
    renderWithProviders(<Navbar />, {
      preloadedState: { auth: { token: 'test-token', user: mentorUser } },
    });
    expect(screen.getByText('MENTOR')).toBeInTheDocument();
  });

  it('toggles mobile menu on hamburger click', () => {
    renderWithProviders(<Navbar />);
    const toggle = screen.getByLabelText('Toggle menu');
    fireEvent.click(toggle);
    expect(screen.getAllByText('Sign In').length).toBeGreaterThan(0);
  });
});

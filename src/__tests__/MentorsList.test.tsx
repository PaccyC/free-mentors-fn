import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import MentorsList from '../pages/mentors/MentorsList';
import { renderWithProviders } from './testUtils';
import { gql } from '../api/client';

const mockGql = gql as jest.Mock;

const mockMentors = [
  {
    id: '10', firstName: 'Alice', lastName: 'Chen', email: 'alice@test.com',
    bio: 'Senior engineer with 10 years experience.',
    address: 'Nairobi', occupation: 'Software Engineer', expertise: 'React, Node.js', role: 'MENTOR',
  },
  {
    id: '11', firstName: 'Bob', lastName: 'Mwangi', email: 'bob@test.com',
    bio: 'UX designer helping startups.',
    address: 'Lagos', occupation: 'UX Designer', expertise: 'Figma, UI Design', role: 'MENTOR',
  },
  {
    id: '12', firstName: 'Carol', lastName: 'Osei', email: 'carol@test.com',
    bio: 'Product manager at a fintech.',
    address: 'Accra', occupation: 'Product Manager', expertise: 'Agile, Roadmapping', role: 'MENTOR',
  },
];

describe('MentorsList page', () => {
  beforeEach(() => {
    mockGql.mockReset();
  });

  it('renders mentor cards after loading', async () => {
    mockGql.mockResolvedValueOnce({ mentors: mockMentors });
    renderWithProviders(<MentorsList />);

    await waitFor(() => {
      expect(screen.getByText('Alice Chen')).toBeInTheDocument();
      expect(screen.getByText('Bob Mwangi')).toBeInTheDocument();
      expect(screen.getByText('Carol Osei')).toBeInTheDocument();
    });
  });

  it('renders a search input', async () => {
    mockGql.mockResolvedValueOnce({ mentors: mockMentors });
    renderWithProviders(<MentorsList />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search by name/i)).toBeInTheDocument();
    });
  });

  it('filters mentors by name', async () => {
    mockGql.mockResolvedValueOnce({ mentors: mockMentors });
    renderWithProviders(<MentorsList />);

    await waitFor(() => screen.getByText('Alice Chen'));

    fireEvent.change(screen.getByPlaceholderText(/search by name/i), {
      target: { value: 'alice' },
    });

    expect(screen.getByText('Alice Chen')).toBeInTheDocument();
    expect(screen.queryByText('Bob Mwangi')).not.toBeInTheDocument();
    expect(screen.queryByText('Carol Osei')).not.toBeInTheDocument();
  });

  it('filters mentors by occupation', async () => {
    mockGql.mockResolvedValueOnce({ mentors: mockMentors });
    renderWithProviders(<MentorsList />);

    await waitFor(() => screen.getByText('Alice Chen'));

    fireEvent.change(screen.getByPlaceholderText(/search by name/i), {
      target: { value: 'designer' },
    });

    expect(screen.queryByText('Alice Chen')).not.toBeInTheDocument();
    expect(screen.getByText('Bob Mwangi')).toBeInTheDocument();
  });

  it('filters mentors by expertise', async () => {
    mockGql.mockResolvedValueOnce({ mentors: mockMentors });
    renderWithProviders(<MentorsList />);

    await waitFor(() => screen.getByText('Alice Chen'));

    fireEvent.change(screen.getByPlaceholderText(/search by name/i), {
      target: { value: 'agile' },
    });

    expect(screen.queryByText('Alice Chen')).not.toBeInTheDocument();
    expect(screen.queryByText('Bob Mwangi')).not.toBeInTheDocument();
    expect(screen.getByText('Carol Osei')).toBeInTheDocument();
  });

  it('shows no results message when search yields nothing', async () => {
    mockGql.mockResolvedValueOnce({ mentors: mockMentors });
    renderWithProviders(<MentorsList />);

    await waitFor(() => screen.getByText('Alice Chen'));

    fireEvent.change(screen.getByPlaceholderText(/search by name/i), {
      target: { value: 'xyznotexist' },
    });

    expect(screen.getByText(/No mentors match/i)).toBeInTheDocument();
  });

  it('shows empty state when no mentors are available', async () => {
    mockGql.mockResolvedValueOnce({ mentors: [] });
    renderWithProviders(<MentorsList />);

    await waitFor(() => {
      expect(screen.getByText('No mentors available yet.')).toBeInTheDocument();
    });
  });

  it('shows error alert on fetch failure', async () => {
    mockGql.mockRejectedValueOnce(new Error('Network error'));
    renderWithProviders(<MentorsList />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('excludes the current logged-in user from the list', async () => {
    mockGql.mockResolvedValueOnce({ mentors: mockMentors });
    renderWithProviders(<MentorsList />, {
      preloadedState: {
        auth: {
          token: 'tok', user: {
            id: '10', firstName: 'Alice', lastName: 'Chen', email: 'alice@test.com',
            bio: '', address: '', occupation: 'Software Engineer', expertise: 'React', role: 'MENTOR',
          },
        },
      },
    });

    await waitFor(() => screen.getByText('Bob Mwangi'));
    expect(screen.queryByText('Alice Chen')).not.toBeInTheDocument();
  });
});

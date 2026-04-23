import authReducer, { setAuth, logout } from '../store/authSlice';
import type { User } from '../types';

const mockUser: User = {
  id: '1',
  firstName: 'Alice',
  lastName: 'Smith',
  email: 'alice@example.com',
  bio: 'A developer',
  address: 'Kigali',
  occupation: 'Engineer',
  expertise: 'React, TypeScript',
  role: 'USER',
};

describe('authSlice', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('handles setAuth correctly', () => {
    const state = authReducer(
      { token: null, user: null },
      setAuth({ token: 'test-token', user: mockUser })
    );
    expect(state.token).toBe('test-token');
    expect(state.user).toEqual(mockUser);
  });

  it('handles logout correctly', () => {
    const authedState = { token: 'test-token', user: mockUser };
    const state = authReducer(authedState, logout());
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });

  it('persists token to localStorage on setAuth', () => {
    authReducer({ token: null, user: null }, setAuth({ token: 'abc', user: mockUser }));
    expect(localStorage.getItem('token')).toBe('abc');
  });

  it('persists user to localStorage on setAuth', () => {
    authReducer({ token: null, user: null }, setAuth({ token: 'abc', user: mockUser }));
    expect(JSON.parse(localStorage.getItem('user') ?? '{}')).toEqual(mockUser);
  });

  it('removes token and user from localStorage on logout', () => {
    authReducer({ token: null, user: null }, setAuth({ token: 'abc', user: mockUser }));
    authReducer({ token: 'abc', user: mockUser }, logout());
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});

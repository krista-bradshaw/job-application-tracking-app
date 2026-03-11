import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the api module so tests don't make real HTTP calls
vi.mock('../utils/api', () => ({
  loginApi: vi.fn(),
  registerApi: vi.fn(),
}));

import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// Helper component to expose the auth context for testing
function AuthConsumer() {
  const { isAuthenticated, isLoading, user } = useAuth();
  return (
    <div>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="user">{user?.email ?? 'none'}</span>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts unauthenticated when localStorage is empty', () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('none');
  });

  it('restores session from localStorage on mount', () => {
    localStorage.setItem('job_tracker_token', 'token123');
    localStorage.setItem('job_tracker_user', JSON.stringify({ id: '1', email: 'test@example.com' }));

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('authenticated').textContent).toBe('true');
    expect(screen.getByTestId('user').textContent).toBe('test@example.com');
  });

  it('clears state after logout', async () => {
    localStorage.setItem('job_tracker_token', 'token123');
    localStorage.setItem('job_tracker_user', JSON.stringify({ id: '1', email: 'test@example.com' }));

    function LogoutButton() {
      const { logout } = useAuth();
      return <button onClick={logout}>Logout</button>;
    }

    const { getByText } = render(
      <AuthProvider>
        <AuthConsumer />
        <LogoutButton />
      </AuthProvider>
    );

    await act(async () => getByText('Logout').click());

    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('none');
    expect(localStorage.getItem('job_tracker_token')).toBeNull();
  });
});

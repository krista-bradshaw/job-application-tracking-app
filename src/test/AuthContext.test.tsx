import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the Supabase client so tests never make real network calls
vi.mock('../lib/supabase', () => {
  const mockGetSession = vi.fn();
  const mockOnAuthStateChange = vi.fn();
  const mockSignOut = vi.fn();
  const mockSignInWithPassword = vi.fn();

  return {
    supabase: {
      auth: {
        getSession: mockGetSession,
        onAuthStateChange: mockOnAuthStateChange,
        signInWithPassword: mockSignInWithPassword,
        signOut: mockSignOut,
      },
    },
  };
});

import { render, screen, act } from '@testing-library/react';
import { supabase } from '../lib/supabase';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// Helper component that exposes the auth context for assertions
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

function LogoutButton() {
  const { logout } = useAuth();
  return <button onClick={() => void logout()}>Logout</button>;
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts unauthenticated when there is no active session', async () => {
    // Arrange: getSession returns no session
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as never);
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    } as never);

    await act(async () => {
      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );
    });

    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('none');
    expect(screen.getByTestId('loading').textContent).toBe('false');
  });

  it('restores session when Supabase reports an active session on mount', async () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
      access_token: 'token123',
    };

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    } as never);
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    } as never);

    await act(async () => {
      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );
    });

    expect(screen.getByTestId('authenticated').textContent).toBe('true');
    expect(screen.getByTestId('user').textContent).toBe('test@example.com');
  });

  it('clears state after logout', async () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
      access_token: 'token123',
    };

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    } as never);

    // Capture the onAuthStateChange callback so we can simulate logout
    let authChangeCallback: (event: string, session: null) => void = () => {};
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((cb) => {
      authChangeCallback = cb as typeof authChangeCallback;
      return { data: { subscription: { unsubscribe: vi.fn() } } } as never;
    });

    vi.mocked(supabase.auth.signOut).mockResolvedValue({
      error: null,
    } as never);

    await act(async () => {
      render(
        <AuthProvider>
          <AuthConsumer />
          <LogoutButton />
        </AuthProvider>
      );
    });

    expect(screen.getByTestId('authenticated').textContent).toBe('true');

    await act(async () => {
      screen.getByText('Logout').click();
      // Simulate Supabase firing the auth state change after signOut
      authChangeCallback('SIGNED_OUT', null);
    });

    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('none');
  });
});

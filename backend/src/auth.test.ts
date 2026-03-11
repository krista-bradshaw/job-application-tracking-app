import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateToken, authenticateToken } from '../src/auth';
import type { Request, Response, NextFunction } from 'express';

// Set a known JWT_SECRET for all tests
process.env.JWT_SECRET = 'test-secret-key-for-vitest-testing-only';

const mockUser = { id: 'user-123', email: 'test@example.com' };

describe('generateToken', () => {
  it('returns a non-empty JWT string', () => {
    const token = generateToken(mockUser);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // header.payload.signature
  });

  it('generates different tokens for different users', () => {
    const token1 = generateToken({ id: '1', email: 'a@example.com' });
    const token2 = generateToken({ id: '2', email: 'b@example.com' });
    expect(token1).not.toBe(token2);
  });
});

describe('authenticateToken middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: vi.fn().mockReturnThis() as unknown as Response['status'],
      json: vi.fn().mockReturnThis() as unknown as Response['json'],
    };
    next = vi.fn();
  });

  it('calls next() with a valid token', () => {
    const token = generateToken(mockUser);
    req.headers = { authorization: `Bearer ${token}` };

    authenticateToken(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect((req as Request).user).toMatchObject(mockUser);
  });

  it('returns 401 when no token is provided', () => {
    req.headers = {};
    authenticateToken(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when token is invalid', () => {
    req.headers = { authorization: 'Bearer invalid.token.here' };
    authenticateToken(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });
});

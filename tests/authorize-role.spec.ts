import { describe, expect, it, vi } from 'vitest';
import type { Response } from 'express';
import { authorizeRole } from '../src/app/http/middlewares/authorize-role';
import { AuthenticatedRequest } from '../src/app/http/interfaces/auth.interface';

const createResponse = () => {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockImplementation(() => res);
  res.json = vi.fn().mockImplementation(() => res);
  return res as Response;
};

describe('authorizeRole middleware', () => {
  it('rejects unauthenticated requests', () => {
    const middleware = authorizeRole('seller');
    const req = { user: undefined } as AuthenticatedRequest;
    const res = createResponse();
    const next = vi.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Usuário não autenticado' });
  });

  it('rejects users without the required role', () => {
    const middleware = authorizeRole('seller');
    const req = {
      user: { id: 'u-1', roles: ['buyer'] }
    } as AuthenticatedRequest;
    const res = createResponse();
    const next = vi.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Usuário não autorizado. Requer perfil "seller".'
    });
  });

  it('allows users with the required role', () => {
    const middleware = authorizeRole('seller');
    const req = {
      user: { id: 'u-1', roles: ['buyer', 'seller'] }
    } as AuthenticatedRequest;
    const res = createResponse();
    const next = vi.fn();

    middleware(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});

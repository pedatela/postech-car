import { NextFunction, Response } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { URL } from 'node:url';
import { authConfig } from '../../../config/auth';
import { AuthenticatedRequest } from '../interfaces/auth.interface';

if (!authConfig.issuer) {
  throw new Error('Auth issuer not configured');
}

const issuerBase = authConfig.issuer.replace(/\/$/, '');
const jwksPath = issuerBase.includes('cognito-idp.')
  ? '/.well-known/jwks.json'
  : '/protocol/openid-connect/certs';
const jwks = createRemoteJWKSet(new URL(`${issuerBase}${jwksPath}`));

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token não informado' });
    }

    const token = header.substring(7);

    const { payload } = await jwtVerify(token, jwks, {
      issuer: authConfig.issuer,
      audience: authConfig.audience
    });

    const realmAccess = payload.realm_access as { roles?: string[] } | undefined;
    const realmRoles = Array.isArray(realmAccess?.roles) ? realmAccess.roles ?? [] : [];
    const groupsClaim = payload['cognito:groups'];
    const cognitoGroups = Array.isArray(groupsClaim)
      ? groupsClaim.filter((group): group is string => typeof group === 'string')
      : [];
    const roles = Array.from(new Set([...realmRoles, ...cognitoGroups]));
    const email = typeof payload.email === 'string' ? payload.email : undefined;
    const name = typeof payload.name === 'string' ? payload.name : undefined;

    req.user = {
      id: (payload.sub as string) ?? '',
      roles,
      ...(email ? { email } : {}),
      ...(name ? { name } : {})
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      message: 'Token inválido',
      details: (error as Error).message
    });
  }
};

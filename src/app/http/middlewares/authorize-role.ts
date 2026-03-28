import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../interfaces/auth.interface';

export const authorizeRole = (requiredRole: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const hasRole = req.user.roles.includes(requiredRole);

    if (!hasRole) {
      return res.status(403).json({
        message: `Usuário não autorizado. Requer perfil "${requiredRole}".`
      });
    }

    return next();
  };
};

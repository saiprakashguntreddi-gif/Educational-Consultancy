import { Request, Response, NextFunction } from 'express';
import { Role } from '../../config/roles';
import { ApiResponse } from '../utils/api-response';

/**
 * Role-Based Access Control (RBAC) Middleware
 * Restricts route access to specified roles
 */
export const requireRoles = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required', 401, 'Unauthorized');
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      ApiResponse.error(
        res,
        `Access denied. Required role(s): ${allowedRoles.join(', ')}`,
        403,
        'Forbidden'
      );
      return;
    }

    next();
  };
};

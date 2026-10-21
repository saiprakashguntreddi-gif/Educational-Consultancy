import { Router, Request, Response } from 'express';
import { authenticateJwt } from '../../shared/middleware/auth.middleware';
import { requireRoles } from '../../shared/middleware/rbac.middleware';
import { Role } from '../../config/roles';
import { ApiResponse } from '../../shared/utils/api-response';

const router = Router();

// Admin module boundary - routes restricted strictly to ADMIN role
router.use(authenticateJwt, requireRoles(Role.ADMIN));

router.get('/health', (_req: Request, res: Response) => {
  ApiResponse.success(res, { module: 'admin', status: 'ready' }, 'Admin module gateway active');
});

export { router as adminRouter };

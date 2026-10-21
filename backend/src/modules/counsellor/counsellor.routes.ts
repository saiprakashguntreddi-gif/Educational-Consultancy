import { Router, Request, Response } from 'express';
import { authenticateJwt } from '../../shared/middleware/auth.middleware';
import { requireRoles } from '../../shared/middleware/rbac.middleware';
import { Role } from '../../config/roles';
import { ApiResponse } from '../../shared/utils/api-response';

const router = Router();

// Counsellor module boundary - routes restricted to COUNSELLOR role
router.use(authenticateJwt, requireRoles(Role.COUNSELLOR, Role.ADMIN));

router.get('/health', (_req: Request, res: Response) => {
  ApiResponse.success(res, { module: 'counsellor', status: 'ready' }, 'Counsellor module gateway active');
});

export { router as counsellorRouter };

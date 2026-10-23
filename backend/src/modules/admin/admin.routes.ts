import { Router, Request, Response } from 'express';
import { authenticateJwt } from '../../shared/middleware/auth.middleware';
import { requireRoles } from '../../shared/middleware/rbac.middleware';
import { validateRequest } from '../../shared/middleware/validation.middleware';
import { Role } from '../../config/roles';
import { ApiResponse } from '../../shared/utils/api-response';
import { AdminController } from './admin.controller';
import {
  listAdminStudentsQuerySchema,
  assignCounsellorSchema,
  adminAuditLogsQuerySchema,
} from './admin.validation';

const router = Router();

// Admin module boundary - routes restricted strictly to ADMIN role
router.use(authenticateJwt, requireRoles(Role.ADMIN));

router.get('/health', (_req: Request, res: Response) => {
  ApiResponse.success(res, { module: 'admin', status: 'ready' }, 'Admin module gateway active');
});

// 1. Platform Dashboard Overview
router.get('/dashboard', AdminController.getDashboard);

// 2. Global Student Management (All students, search, filters, assignment status)
router.get(
  '/students',
  validateRequest(listAdminStudentsQuerySchema),
  AdminController.listAllStudents
);

// 3. Assign or Reassign Counsellor to Student
router.post(
  '/students/:profileId/assign',
  validateRequest(assignCounsellorSchema),
  AdminController.assignCounsellor
);

// 4. List Counsellors Directory & Workloads
router.get('/counsellors', AdminController.listCounsellors);

// 5. System Audit Logs
router.get(
  '/audit-logs',
  validateRequest(adminAuditLogsQuerySchema),
  AdminController.getAuditLogs
);

// 6. Export Platform Students CSV
router.get('/export', AdminController.exportStudents);

// 7. Platform Applications Overview
router.get('/applications', AdminController.listApplications);

export { router as adminRouter };

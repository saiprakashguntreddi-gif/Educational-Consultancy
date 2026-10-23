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
  createCounsellorSchema,
  updateCounsellorSchema,
  updateCounsellorStatusSchema,
  updateCounsellorSkillsSchema,
  sessionAuditQuerySchema,
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
router.patch(
  '/students/:profileId/assign',
  validateRequest(assignCounsellorSchema),
  AdminController.assignCounsellor
);

// 4. Student Assignment History
router.get(
  '/students/:profileId/assignment-history',
  AdminController.getStudentAssignmentHistory
);

// 5. Counsellor Directory & Lifecycle Management
router.get('/counsellors', AdminController.listCounsellors);
router.post(
  '/counsellors',
  validateRequest(createCounsellorSchema),
  AdminController.createCounsellor
);
router.patch(
  '/counsellors/:counsellorId',
  validateRequest(updateCounsellorSchema),
  AdminController.updateCounsellor
);
router.patch(
  '/counsellors/:counsellorId/status',
  validateRequest(updateCounsellorStatusSchema),
  AdminController.updateCounsellorStatus
);
router.patch(
  '/counsellors/:counsellorId/skills',
  validateRequest(updateCounsellorSkillsSchema),
  AdminController.updateCounsellorSkills
);

// 6. Counselling Session Audit Log (All meetings, outcomes, notes)
router.get(
  '/sessions/audit',
  validateRequest(sessionAuditQuerySchema),
  AdminController.listSessionAudits
);
router.get(
  '/session-audits',
  validateRequest(sessionAuditQuerySchema),
  AdminController.listSessionAudits
);

// 7. Counsellor Performance Leaderboard & Points Module (PDF Requirement)
router.get(
  '/counsellors/performance',
  AdminController.getCounsellorPerformance
);
router.post(
  '/counsellors/:id/award-points',
  AdminController.awardCounsellorPoints
);

// 8. System Audit Logs
router.get(
  '/audit-logs',
  validateRequest(adminAuditLogsQuerySchema),
  AdminController.getAuditLogs
);

// 9. Export Platform Students CSV
router.get('/export', AdminController.exportStudents);

// 10. Platform Applications Overview
router.get('/applications', AdminController.listApplications);

export { router as adminRouter };


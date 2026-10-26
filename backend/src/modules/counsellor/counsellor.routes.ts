import { Router, Request, Response } from 'express';
import { authenticateJwt } from '../../shared/middleware/auth.middleware';
import { requireRoles } from '../../shared/middleware/rbac.middleware';
import { validateRequest } from '../../shared/middleware/validation.middleware';
import { Role } from '../../config/roles';
import { ApiResponse } from '../../shared/utils/api-response';
import { CounsellorController } from './counsellor.controller';
import {
  listCounsellorStudentsQuerySchema,
  createStudentByStaffSchema,
  createActionPlanSchema,
  updateActionPlanSchema,
  createStudentNoteSchema,
} from './counsellor.validation';

const router = Router();

// Counselling operations boundary - routes restricted strictly to ADMIN role
router.use(authenticateJwt, requireRoles(Role.ADMIN));

router.get('/health', (_req: Request, res: Response) => {
  ApiResponse.success(res, { module: 'counsellor', status: 'ready' }, 'Counsellor module gateway active');
});

// 1. Dashboard & Workload Overview
router.get('/dashboard', CounsellorController.getDashboard);

// 2. Manage Students: List Assigned Roster with Search and Filters
router.get(
  '/students',
  validateRequest(listCounsellorStudentsQuerySchema),
  CounsellorController.listStudents
);

// 3. Export Roster to CSV
router.get('/export', CounsellorController.exportStudents);

// 4. Create Student Account Directly (when direct registration is restricted)
router.post(
  '/students',
  validateRequest(createStudentByStaffSchema),
  CounsellorController.createStudentAccount
);

// 5. Claim an Unassigned Student
router.post('/students/:profileId/claim', CounsellorController.claimStudent);

// 6. Manage Students: 360-Degree Holistic Profile View (IDOR protected)
router.get('/students/:profileId', CounsellorController.getStudent360);

// 7. Action Plans / Guidance Milestones
router.get('/students/:profileId/action-plans', CounsellorController.getActionPlans);
router.post(
  '/students/:profileId/action-plans',
  validateRequest(createActionPlanSchema),
  CounsellorController.createActionPlan
);
router.patch(
  '/action-plans/:itemId',
  validateRequest(updateActionPlanSchema),
  CounsellorController.updateActionPlan
);
router.delete('/action-plans/:itemId', CounsellorController.deleteActionPlan);

// 8. Counsellor Advisory Notes
router.get('/students/:profileId/notes', CounsellorController.getNotes);
router.post(
  '/students/:profileId/notes',
  validateRequest(createStudentNoteSchema),
  CounsellorController.createNote
);

export { router as counsellorRouter };

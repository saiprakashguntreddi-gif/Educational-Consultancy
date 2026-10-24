import { Router } from 'express';
import { EntranceController } from './entrance.controller';
import { authenticateJwt, optionalAuthenticateJwt } from '../../shared/middleware/auth.middleware';
import { requireRoles } from '../../shared/middleware/rbac.middleware';
import { validateRequest } from '../../shared/middleware/validation.middleware';
import { Role } from '../../config/roles';
import {
  saveExamPlanSchema,
  updateExamPlanSchema,
  deleteExamPlanSchema,
  submitMockTestSchema,
  getExamByIdSchema,
  getPlanByProfileIdSchema,
} from './entrance.validation';

const router = Router();

// ==========================================
// CATALOG & PUBLIC / STUDENT DISCOVERY
// ==========================================

// Catalog list with optional personalized recommendation detection
router.get('/', optionalAuthenticateJwt, EntranceController.getCatalog);

// Main exam categories hierarchy with resolved unique subcategories
router.get('/categories', optionalAuthenticateJwt, EntranceController.getCategories);

// ==========================================
// STUDENT PERSONAL EXAM PLAN (MODULE 4)
// ==========================================

// Get authenticated student's saved plan
router.get(
  '/plan/me',
  authenticateJwt,
  requireRoles(Role.STUDENT),
  EntranceController.getMyPlan
);

// Save an exam to personal plan
router.post(
  '/plan',
  authenticateJwt,
  requireRoles(Role.STUDENT),
  validateRequest(saveExamPlanSchema),
  EntranceController.savePlanItem
);

// Update status, target dates, or scores in personal plan
router.put(
  '/plan/:id',
  authenticateJwt,
  requireRoles(Role.STUDENT),
  validateRequest(updateExamPlanSchema),
  EntranceController.updatePlanItem
);

// Remove an exam from personal plan
router.delete(
  '/plan/:id',
  authenticateJwt,
  requireRoles(Role.STUDENT),
  validateRequest(deleteExamPlanSchema),
  EntranceController.removePlanItem
);

// ==========================================
// MOCK TESTS & ATTEMPTS
// ==========================================

// Get authenticated student's past mock attempts & scores
router.get(
  '/mock-attempts/me',
  authenticateJwt,
  requireRoles(Role.STUDENT),
  EntranceController.getMyMockAttempts
);

// Get mock test payload for taking (strips correct answers/explanations until submitted)
router.get(
  '/mock-tests/:testId',
  authenticateJwt,
  EntranceController.getMockTest
);

// Submit timed mock test for server-side evaluation & grading
router.post(
  '/mock-tests/:testId/submit',
  authenticateJwt,
  requireRoles(Role.STUDENT),
  validateRequest(submitMockTestSchema),
  EntranceController.submitMockTest
);

// ==========================================
// COUNSELLOR & ADMIN REVIEW ROUTE
// ==========================================

// Staff review of a student's entrance exam plan
router.get(
  '/plan/profile/:studentProfileId',
  authenticateJwt,
  requireRoles(Role.COUNSELLOR, Role.ADMIN),
  validateRequest(getPlanByProfileIdSchema),
  EntranceController.getPlanByProfileId
);

// ==========================================
// EXAM DETAILS & ASSOCIATED MOCK TESTS (BY ID)
// ==========================================

// Get single exam details by ID
router.get(
  '/:id',
  optionalAuthenticateJwt,
  validateRequest(getExamByIdSchema),
  EntranceController.getExamById
);

// Admin: Assign exam to multiple categories
router.put(
  '/:id/categories',
  authenticateJwt,
  requireRoles(Role.ADMIN, Role.COUNSELLOR),
  EntranceController.updateExamCategories
);

// List available mock tests for a specific exam
router.get(
  '/:id/mock-tests',
  optionalAuthenticateJwt,
  validateRequest(getExamByIdSchema),
  EntranceController.getMockTestsForExam
);

export { router as entranceRouter };

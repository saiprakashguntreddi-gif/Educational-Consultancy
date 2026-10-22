import { Router } from 'express';
import { AssessmentsController } from './assessments.controller';
import { authenticateJwt } from '../../shared/middleware/auth.middleware';
import { requireRoles } from '../../shared/middleware/rbac.middleware';
import { validateRequest } from '../../shared/middleware/validation.middleware';
import { Role } from '../../config/roles';
import {
  generateAccessCodeSchema,
  verifyAccessCodeSchema,
  startAttemptSchema,
  saveProgressSchema,
  submitAttemptSchema,
  saveActionPlanSchema,
} from './assessments.validation';

export const assessmentsRouter = Router();

// ==========================================
// 1. STUDENT ASSESSMENT PATHWAYS & ATTEMPTS
// ==========================================

// List all 8 pathways with student attempt/completion status
assessmentsRouter.get(
  '/pathways',
  authenticateJwt,
  AssessmentsController.listPathways
);

// Get pathway instructions, questions, and limitations
assessmentsRouter.get(
  '/pathways/:pathwayCode',
  authenticateJwt,
  AssessmentsController.getPathwayDetails
);

// Verify and unlock an access code
assessmentsRouter.post(
  '/access-codes/verify',
  authenticateJwt,
  validateRequest(verifyAccessCodeSchema),
  AssessmentsController.verifyAccessCode
);

// Start new attempt or resume incomplete attempt
assessmentsRouter.post(
  '/attempts/:pathwayCode/start',
  authenticateJwt,
  requireRoles(Role.STUDENT),
  validateRequest(startAttemptSchema),
  AssessmentsController.startAttempt
);

// Auto-save attempt progress
assessmentsRouter.post(
  '/attempts/:attemptId/save-progress',
  authenticateJwt,
  requireRoles(Role.STUDENT),
  validateRequest(saveProgressSchema),
  AssessmentsController.saveProgress
);

// Submit attempt and score report
assessmentsRouter.post(
  '/attempts/:attemptId/submit',
  authenticateJwt,
  requireRoles(Role.STUDENT),
  validateRequest(submitAttemptSchema),
  AssessmentsController.submitAttempt
);

// View diagnostic report
assessmentsRouter.get(
  '/reports/:reportId',
  authenticateJwt,
  AssessmentsController.getReport
);

// ==========================================
// 2. COUNSELLOR MANAGEMENT & REVIEW SUITE
// ==========================================

// Counsellor generates an access code
assessmentsRouter.post(
  '/access-codes/generate',
  authenticateJwt,
  requireRoles(Role.COUNSELLOR, Role.ADMIN),
  validateRequest(generateAccessCodeSchema),
  AssessmentsController.generateAccessCode
);

// Counsellor lists all generated access codes
assessmentsRouter.get(
  '/access-codes',
  authenticateJwt,
  requireRoles(Role.COUNSELLOR, Role.ADMIN),
  AssessmentsController.listAccessCodes
);

// Counsellor integrated review (Report alongside academics, preferences, shortlists)
assessmentsRouter.get(
  '/counsellor/review/:studentProfileId',
  authenticateJwt,
  requireRoles(Role.COUNSELLOR, Role.ADMIN),
  AssessmentsController.getCounsellorReview
);

// Counsellor attaches discussion points & action plan
assessmentsRouter.post(
  '/counsellor/reports/:reportId/action-plan',
  authenticateJwt,
  requireRoles(Role.COUNSELLOR, Role.ADMIN),
  validateRequest(saveActionPlanSchema),
  AssessmentsController.saveActionPlan
);

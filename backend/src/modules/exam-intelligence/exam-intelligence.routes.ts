import { Router } from 'express';
import { ExamIntelligenceController } from './exam-intelligence.controller';
import { authenticateJwt, optionalAuthenticateJwt } from '../../shared/middleware/auth.middleware';
import { requireRoles } from '../../shared/middleware/rbac.middleware';
import { validateRequest } from '../../shared/middleware/validation.middleware';
import { Role } from '../../config/roles';
import {
  saveExamPlanSchema,
  updateExamPlanSchema,
  deleteExamPlanSchema,
  submitMockTestSchema,
  getPreparationPlanSchema,
  getStudentIntelligenceSchema,
} from './exam-intelligence.validation';

export const examIntelligenceRouter = Router();

// ==========================================
// 1. INTELLIGENCE & COLLEGE REQUIREMENTS
// ==========================================

// Overview of entrance exams, college requirements mapping, deadlines, and plan summary
examIntelligenceRouter.get(
  '/overview',
  authenticateJwt,
  ExamIntelligenceController.getOverview
);

// Structured preparation milestones, study guidance, books, and tips
examIntelligenceRouter.get(
  '/preparation-plan/:examId',
  optionalAuthenticateJwt,
  validateRequest(getPreparationPlanSchema),
  ExamIntelligenceController.getPreparationPlan
);

// ==========================================
// 2. TIMED MOCK TEST DIAGNOSTIC ENGINE
// ==========================================

// Load mock test for taking (strips correct answers & explanations for anti-cheat)
examIntelligenceRouter.get(
  '/mock-tests/:testId',
  authenticateJwt,
  ExamIntelligenceController.getMockTest
);

// Submit timed mock test for server-side evaluation & diagnostic scoring
examIntelligenceRouter.post(
  '/mock-tests/:testId/submit',
  authenticateJwt,
  requireRoles(Role.STUDENT),
  validateRequest(submitMockTestSchema),
  ExamIntelligenceController.submitMockTest
);

// ==========================================
// 3. STUDENT EXAM PLAN & DEADLINES
// ==========================================

// Add exam to personal plan
examIntelligenceRouter.post(
  '/plan',
  authenticateJwt,
  requireRoles(Role.STUDENT),
  validateRequest(saveExamPlanSchema),
  ExamIntelligenceController.savePlan
);

// Update status, target date, target score, or actual achieved score
examIntelligenceRouter.put(
  '/plan/:id',
  authenticateJwt,
  requireRoles(Role.STUDENT),
  validateRequest(updateExamPlanSchema),
  ExamIntelligenceController.updatePlan
);

// Remove exam from personal plan
examIntelligenceRouter.delete(
  '/plan/:id',
  authenticateJwt,
  requireRoles(Role.STUDENT),
  validateRequest(deleteExamPlanSchema),
  ExamIntelligenceController.deletePlan
);

// ==========================================
// 4. COUNSELLOR & ADMIN FOLLOW-UP
// ==========================================

// Staff review of a student's exam intelligence and mock performance
examIntelligenceRouter.get(
  '/counsellor/student/:studentProfileId',
  authenticateJwt,
  requireRoles(Role.COUNSELLOR, Role.ADMIN),
  validateRequest(getStudentIntelligenceSchema),
  ExamIntelligenceController.getStudentIntelligenceForStaff
);

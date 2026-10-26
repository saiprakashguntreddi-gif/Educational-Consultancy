import { Router } from 'express';
import { RecommendationsController } from './recommendations.controller';
import { authenticateJwt } from '../../shared/middleware/auth.middleware';
import { requireRoles } from '../../shared/middleware/rbac.middleware';
import { validateRequest } from '../../shared/middleware/validation.middleware';
import { Role } from '../../config/roles';
import {
  counsellorReviewSchema,
  tierOverrideSchema,
  generateRecommendationsSchema,
  adminAssignTierSchema,
  adminToggleCollegeStatusSchema,
  adminCreateManagedCollegeSchema,
  adminUpdateManagedCollegeSchema,
  adminListManagedCollegesQuerySchema,
} from './recommendations.validation';

const router = Router();

// All recommendations endpoints require authentication
router.use(authenticateJwt);

// --- Admin College Tier Management Endpoints (Admin ONLY) ---
router.get(
  '/admin/college-tiers',
  requireRoles(Role.ADMIN),
  validateRequest(adminListManagedCollegesQuerySchema),
  RecommendationsController.adminListManagedColleges
);

router.post(
  '/admin/college-tiers',
  requireRoles(Role.ADMIN),
  validateRequest(adminCreateManagedCollegeSchema),
  RecommendationsController.adminCreateManagedCollege
);

router.put(
  '/admin/college-tiers/:id',
  requireRoles(Role.ADMIN),
  validateRequest(adminUpdateManagedCollegeSchema),
  RecommendationsController.adminUpdateManagedCollege
);

router.patch(
  '/admin/college-tiers/:id/tier',
  requireRoles(Role.ADMIN),
  validateRequest(adminAssignTierSchema),
  RecommendationsController.adminAssignCollegeTier
);

router.patch(
  '/admin/college-tiers/:id/status',
  requireRoles(Role.ADMIN),
  validateRequest(adminToggleCollegeStatusSchema),
  RecommendationsController.adminToggleCollegeStatus
);

// Student endpoints
router.get(
  '/my-recommendations',
  requireRoles(Role.STUDENT, Role.ADMIN),
  RecommendationsController.getMyRecommendations
);

router.post(
  '/generate',
  requireRoles(Role.STUDENT, Role.ADMIN),
  validateRequest(generateRecommendationsSchema),
  RecommendationsController.generateRecommendations
);

router.post(
  '/items/:id/shortlist',
  requireRoles(Role.STUDENT),
  RecommendationsController.toggleShortlist
);

router.get(
  '/cohort-analytics/:institutionId',
  RecommendationsController.getCohortAnalytics
);

// Admin review endpoints
router.get(
  '/student/:studentProfileId',
  requireRoles(Role.ADMIN),
  RecommendationsController.getStudentRecommendationsForStaff
);

router.put(
  '/batch/:batchId/counsellor-review',
  requireRoles(Role.ADMIN),
  validateRequest(counsellorReviewSchema),
  RecommendationsController.reviewBatchByCounsellor
);

router.patch(
  '/items/:id/tier-override',
  requireRoles(Role.ADMIN),
  validateRequest(tierOverrideSchema),
  RecommendationsController.overrideItemTier
);

export const recommendationsRouter = router;


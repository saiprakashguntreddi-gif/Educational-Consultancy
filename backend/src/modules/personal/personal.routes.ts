import { Router } from 'express';
import { PersonalController } from './personal.controller';
import { authenticateJwt } from '../../shared/middleware/auth.middleware';
import { requireRoles } from '../../shared/middleware/rbac.middleware';
import { validateRequest } from '../../shared/middleware/validation.middleware';
import { Role } from '../../config/roles';
import {
  updateContactGuardianSchema,
  createActivitySchema,
  updateActivitySchema,
  createAchievementSchema,
  updateAchievementSchema,
  deleteItemSchema,
  getPersonalByProfileIdSchema,
} from './personal.validation';

const router = Router();

// ==========================================
// STUDENT PERSONAL INFORMATION (MODULE 5)
// ==========================================

// Get authenticated student's full personal info, guardian, activities, and achievements
router.get(
  '/me',
  authenticateJwt,
  requireRoles(Role.STUDENT),
  PersonalController.getMyPersonal
);

// Update contact info & guardian details
router.put(
  '/me/contact-guardian',
  authenticateJwt,
  requireRoles(Role.STUDENT),
  validateRequest(updateContactGuardianSchema),
  PersonalController.updateContactGuardian
);

// ==========================================
// EXTRACURRICULAR ACTIVITIES
// ==========================================

// Add a new extracurricular activity
router.post(
  '/me/activities',
  authenticateJwt,
  requireRoles(Role.STUDENT),
  validateRequest(createActivitySchema),
  PersonalController.addActivity
);

// Update an existing activity (ownership enforced)
router.put(
  '/me/activities/:id',
  authenticateJwt,
  requireRoles(Role.STUDENT),
  validateRequest(updateActivitySchema),
  PersonalController.updateActivity
);

// Delete an activity (ownership enforced)
router.delete(
  '/me/activities/:id',
  authenticateJwt,
  requireRoles(Role.STUDENT),
  validateRequest(deleteItemSchema),
  PersonalController.deleteActivity
);

// ==========================================
// ACHIEVEMENTS & RECOGNITIONS
// ==========================================

// Record a new achievement
router.post(
  '/me/achievements',
  authenticateJwt,
  requireRoles(Role.STUDENT),
  validateRequest(createAchievementSchema),
  PersonalController.addAchievement
);

// Update an achievement (ownership enforced)
router.put(
  '/me/achievements/:id',
  authenticateJwt,
  requireRoles(Role.STUDENT),
  validateRequest(updateAchievementSchema),
  PersonalController.updateAchievement
);

// Delete an achievement (ownership enforced)
router.delete(
  '/me/achievements/:id',
  authenticateJwt,
  requireRoles(Role.STUDENT),
  validateRequest(deleteItemSchema),
  PersonalController.deleteAchievement
);

// ==========================================
// STAFF REVIEW ROUTE (COUNSELLOR / ADMIN)
// ==========================================

// Staff review student's personal info
router.get(
  '/profile/:studentProfileId',
  authenticateJwt,
  requireRoles(Role.COUNSELLOR, Role.ADMIN),
  validateRequest(getPersonalByProfileIdSchema),
  PersonalController.getPersonalByProfileId
);

export { router as personalRouter };

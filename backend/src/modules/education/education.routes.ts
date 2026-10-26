import { Router } from 'express';
import { EducationController } from './education.controller';
import { authenticateJwt } from '../../shared/middleware/auth.middleware';
import { requireRoles } from '../../shared/middleware/rbac.middleware';
import { validateRequest } from '../../shared/middleware/validation.middleware';
import { Role } from '../../config/roles';
import {
  saveEducationSchema,
  getEducationByProfileIdSchema,
} from './education.validation';

const router = Router();

// ==========================================
// STUDENT EDUCATION DETAILS (MODULE 3)
// ==========================================

// Authenticated student saves or updates their own education details
router.post(
  '/me',
  authenticateJwt,
  requireRoles(Role.STUDENT),
  validateRequest(saveEducationSchema),
  EducationController.saveMyEducation
);

router.put(
  '/me',
  authenticateJwt,
  requireRoles(Role.STUDENT),
  validateRequest(saveEducationSchema),
  EducationController.saveMyEducation
);

// Authenticated student views their own education details
router.get(
  '/me',
  authenticateJwt,
  requireRoles(Role.STUDENT),
  EducationController.getMyEducation
);

// ==========================================
// ADMIN REVIEW ROUTES
// ==========================================

// Admin views education details for a specific student profile
router.get(
  '/profile/:studentProfileId',
  authenticateJwt,
  requireRoles(Role.ADMIN),
  validateRequest(getEducationByProfileIdSchema),
  EducationController.getEducationByProfileId
);

export { router as educationRouter };

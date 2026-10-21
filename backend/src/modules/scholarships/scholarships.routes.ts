import { Router } from 'express';
import { ScholarshipsController } from './scholarships.controller';
import { authenticateJwt } from '../../shared/middleware/auth.middleware';
import { requireRoles } from '../../shared/middleware/rbac.middleware';
import { validateRequest } from '../../shared/middleware/validation.middleware';
import { Role } from '../../config/roles';
import {
  scholarshipIdParamSchema,
  studentListScholarshipsQuerySchema,
  adminListScholarshipsQuerySchema,
  adminCreateScholarshipSchema,
  adminUpdateScholarshipSchema,
  adminToggleScholarshipStatusSchema,
} from './scholarships.validation';

const router = Router();

// All scholarships endpoints require authentication
router.use(authenticateJwt);

// --- Admin Management Endpoints (Admin ONLY) ---
router.get(
  '/admin/all',
  requireRoles(Role.ADMIN),
  validateRequest(adminListScholarshipsQuerySchema),
  ScholarshipsController.adminListScholarships
);

router.post(
  '/admin',
  requireRoles(Role.ADMIN),
  validateRequest(adminCreateScholarshipSchema),
  ScholarshipsController.adminCreateScholarship
);

router.put(
  '/admin/:id',
  requireRoles(Role.ADMIN),
  validateRequest(adminUpdateScholarshipSchema),
  ScholarshipsController.adminUpdateScholarship
);

router.patch(
  '/admin/:id/status',
  requireRoles(Role.ADMIN),
  validateRequest(adminToggleScholarshipStatusSchema),
  ScholarshipsController.adminToggleScholarshipStatus
);

router.delete(
  '/admin/:id',
  requireRoles(Role.ADMIN),
  validateRequest(scholarshipIdParamSchema),
  ScholarshipsController.adminDeleteScholarship
);

// --- Student Discovery & Saved Shortlist Endpoints ---
router.get(
  '/saved/me',
  requireRoles(Role.STUDENT),
  ScholarshipsController.getSavedScholarships
);

router.get(
  '/',
  requireRoles(Role.STUDENT, Role.COUNSELLOR, Role.ADMIN),
  validateRequest(studentListScholarshipsQuerySchema),
  ScholarshipsController.listScholarshipsForStudent
);

router.get(
  '/:id',
  requireRoles(Role.STUDENT, Role.COUNSELLOR, Role.ADMIN),
  validateRequest(scholarshipIdParamSchema),
  ScholarshipsController.getScholarshipDetail
);

router.post(
  '/:id/save',
  requireRoles(Role.STUDENT),
  validateRequest(scholarshipIdParamSchema),
  ScholarshipsController.toggleSaveScholarship
);

export const scholarshipsRouter = router;

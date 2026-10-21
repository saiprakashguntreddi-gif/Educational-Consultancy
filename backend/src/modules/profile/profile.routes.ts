import { Router } from 'express';
import { ProfileController } from './profile.controller';
import { authenticateJwt } from '../../shared/middleware/auth.middleware';
import { requireRoles } from '../../shared/middleware/rbac.middleware';
import { validateRequest } from '../../shared/middleware/validation.middleware';
import { requireVerifiedStudentProfile } from '../../shared/middleware/verification.middleware';
import { Role } from '../../config/roles';
import { profileIntakeSchema, verifyProfileSchema } from './profile.validation';

const router = Router();

// ==========================================
// STUDENT PROFILE INTAKE ROUTES (MODULE 1)
// ==========================================

// Student submits or updates profile intake (Open to students while PENDING or REJECTED)
router.post(
  '/intake',
  authenticateJwt,
  requireRoles(Role.STUDENT),
  validateRequest(profileIntakeSchema),
  ProfileController.submitIntake
);

// Student views their own profile record & verification status (Open to students while PENDING or REJECTED)
router.get(
  '/me',
  authenticateJwt,
  requireRoles(Role.STUDENT),
  ProfileController.getMyProfile
);

// Protected action: Retrieve official verified student record & guidance clearance
// Strictly restricted by requireVerifiedStudentProfile (Blocked with 403 if PENDING or REJECTED)
router.get(
  '/me/verified',
  authenticateJwt,
  requireRoles(Role.STUDENT, Role.COUNSELLOR, Role.ADMIN),
  requireVerifiedStudentProfile,
  ProfileController.getVerifiedRecord
);

// ==========================================
// COUNSELLOR & ADMIN VERIFICATION ROUTES
// ==========================================

// Counsellors/Admins view list of profiles for verification review
router.get(
  '/review',
  authenticateJwt,
  requireRoles(Role.COUNSELLOR, Role.ADMIN),
  ProfileController.listProfiles
);

// Counsellors/Admins view a specific student's profile record
router.get(
  '/:id',
  authenticateJwt,
  requireRoles(Role.COUNSELLOR, Role.ADMIN),
  ProfileController.getProfileById
);

// Counsellors/Admins verify or reject student profile
router.patch(
  '/:id/verify',
  authenticateJwt,
  requireRoles(Role.COUNSELLOR, Role.ADMIN),
  validateRequest(verifyProfileSchema),
  ProfileController.verifyProfile
);

export { router as profileRouter };

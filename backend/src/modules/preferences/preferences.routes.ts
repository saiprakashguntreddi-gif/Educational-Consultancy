import { Router } from 'express';
import { PreferencesController } from './preferences.controller';
import { authenticateJwt } from '../../shared/middleware/auth.middleware';
import { requireRoles } from '../../shared/middleware/rbac.middleware';
import { validateRequest } from '../../shared/middleware/validation.middleware';
import { Role } from '../../config/roles';
import {
  savePreferencesSchema,
  getPreferencesByProfileIdSchema,
} from './preferences.validation';

const router = Router();

// ==========================================
// STUDENT PREFERENCES ROUTES (MODULE 2)
// ==========================================

// Authenticated student saves or updates their own preferences
router.post(
  '/me',
  authenticateJwt,
  requireRoles(Role.STUDENT),
  validateRequest(savePreferencesSchema),
  PreferencesController.saveMyPreferences
);

router.put(
  '/me',
  authenticateJwt,
  requireRoles(Role.STUDENT),
  validateRequest(savePreferencesSchema),
  PreferencesController.saveMyPreferences
);

// Authenticated student views their own preferences
router.get(
  '/me',
  authenticateJwt,
  requireRoles(Role.STUDENT),
  PreferencesController.getMyPreferences
);

// ==========================================
// COUNSELLOR & ADMIN REVIEW ROUTES
// ==========================================

// Counsellor/Admin views preferences for a specific student profile
router.get(
  '/profile/:studentProfileId',
  authenticateJwt,
  requireRoles(Role.COUNSELLOR, Role.ADMIN),
  validateRequest(getPreferencesByProfileIdSchema),
  PreferencesController.getPreferencesByProfileId
);

export { router as preferencesRouter };

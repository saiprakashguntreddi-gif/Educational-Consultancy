import { Router } from 'express';
import { CollegesController } from './colleges.controller';
import { authenticateJwt, optionalAuthenticateJwt } from '../../shared/middleware/auth.middleware';
import { requireRoles } from '../../shared/middleware/rbac.middleware';
import { validateRequest } from '../../shared/middleware/validation.middleware';
import { Role } from '../../config/roles';
import {
  listCollegesQuerySchema,
  adminListCollegesQuerySchema,
  institutionIdParamSchema,
  courseIdParamSchema,
  saveItemBodySchema,
  adminCreateInstitutionSchema,
  adminUpdateInstitutionSchema,
  adminPublishInstitutionSchema,
  adminVerifyInstitutionSchema,
  adminCreateCourseSchema,
  adminUpdateCourseSchema,
} from './colleges.validation';

const router = Router();

// ==========================================
// 1. DISCOVERY CATALOG & SEARCH (STUDENTS, COUNSELLORS, PUBLIC)
// ==========================================

// Discover colleges with multi-faceted search, filters & pagination
router.get(
  '/',
  optionalAuthenticateJwt,
  validateRequest(listCollegesQuerySchema),
  CollegesController.listColleges
);

// ==========================================
// 2. SAVED COLLEGES & COURSES (STUDENT SHORTLIST)
// ==========================================

// Get authenticated student's saved institutions and courses
router.get(
  '/saved/me',
  authenticateJwt,
  requireRoles(Role.STUDENT),
  CollegesController.getSaved
);

// Save institution
router.post(
  '/saved/institutions/:id',
  authenticateJwt,
  requireRoles(Role.STUDENT),
  validateRequest(institutionIdParamSchema),
  validateRequest(saveItemBodySchema),
  CollegesController.saveInstitution
);

// Remove saved institution
router.delete(
  '/saved/institutions/:id',
  authenticateJwt,
  requireRoles(Role.STUDENT),
  validateRequest(institutionIdParamSchema),
  CollegesController.unsaveInstitution
);

// Save course
router.post(
  '/saved/courses/:courseId',
  authenticateJwt,
  requireRoles(Role.STUDENT),
  validateRequest(courseIdParamSchema),
  validateRequest(saveItemBodySchema),
  CollegesController.saveCourse
);

// Remove saved course
router.delete(
  '/saved/courses/:courseId',
  authenticateJwt,
  requireRoles(Role.STUDENT),
  validateRequest(courseIdParamSchema),
  CollegesController.unsaveCourse
);

// ==========================================
// 3. COLLEGE COMPARISON SUITE (STUDENT ONLY)
// ==========================================

// Get authenticated student's comparison matrix
router.get(
  '/compare/me',
  authenticateJwt,
  requireRoles(Role.STUDENT),
  CollegesController.getComparison
);

// Clear comparison set
router.delete(
  '/compare',
  authenticateJwt,
  requireRoles(Role.STUDENT),
  CollegesController.clearComparison
);

// Add institution to comparison
router.post(
  '/compare/:id',
  authenticateJwt,
  requireRoles(Role.STUDENT),
  validateRequest(institutionIdParamSchema),
  CollegesController.addToComparison
);

// Remove institution from comparison
router.delete(
  '/compare/:id',
  authenticateJwt,
  requireRoles(Role.STUDENT),
  validateRequest(institutionIdParamSchema),
  CollegesController.removeFromComparison
);

// ==========================================
// 4. ADMIN & CONTENT MANAGEMENT SUITE (ROLE: ADMIN ONLY)
// ==========================================

// Admin: List all colleges across all statuses (Draft, Review, Published, Archived)
router.get(
  '/admin/all',
  authenticateJwt,
  requireRoles(Role.ADMIN),
  validateRequest(adminListCollegesQuerySchema),
  CollegesController.adminListColleges
);

// Admin: Create new college/institution
router.post(
  '/admin',
  authenticateJwt,
  requireRoles(Role.ADMIN),
  validateRequest(adminCreateInstitutionSchema),
  CollegesController.adminCreateCollege
);

// Admin: Update course program
router.put(
  '/admin/courses/:courseId',
  authenticateJwt,
  requireRoles(Role.ADMIN),
  validateRequest(adminUpdateCourseSchema),
  CollegesController.adminUpdateCourse
);

// Admin: Publish / Unpublish course program
router.patch(
  '/admin/courses/:courseId/publish',
  authenticateJwt,
  requireRoles(Role.ADMIN),
  validateRequest(courseIdParamSchema),
  CollegesController.adminSetCoursePublishStatus
);

// Admin: Delete / Archive course program
router.delete(
  '/admin/courses/:courseId',
  authenticateJwt,
  requireRoles(Role.ADMIN),
  validateRequest(courseIdParamSchema),
  CollegesController.adminDeleteCourse
);

// Admin: Get single college details (all statuses, all courses)
router.get(
  '/admin/:id',
  authenticateJwt,
  requireRoles(Role.ADMIN),
  validateRequest(institutionIdParamSchema),
  CollegesController.adminGetCollegeById
);

// Admin: Update college details
router.put(
  '/admin/:id',
  authenticateJwt,
  requireRoles(Role.ADMIN),
  validateRequest(adminUpdateInstitutionSchema),
  CollegesController.adminUpdateCollege
);

// Admin: Publish / Unpublish college
router.patch(
  '/admin/:id/publish',
  authenticateJwt,
  requireRoles(Role.ADMIN),
  validateRequest(adminPublishInstitutionSchema),
  CollegesController.adminSetPublishStatus
);

// Admin: Verify / Unverify college
router.patch(
  '/admin/:id/verify',
  authenticateJwt,
  requireRoles(Role.ADMIN),
  validateRequest(adminVerifyInstitutionSchema),
  CollegesController.adminSetVerifyStatus
);

// Admin: Archive college
router.patch(
  '/admin/:id/archive',
  authenticateJwt,
  requireRoles(Role.ADMIN),
  validateRequest(institutionIdParamSchema),
  CollegesController.adminArchiveCollege
);

// Admin: Add course to college
router.post(
  '/admin/:id/courses',
  authenticateJwt,
  requireRoles(Role.ADMIN),
  validateRequest(adminCreateCourseSchema),
  CollegesController.adminCreateCourse
);

// ==========================================
// 5. DETAILED VIEWS (COURSE & INSTITUTION)
// ==========================================

// Course details
router.get(
  '/courses/:courseId',
  optionalAuthenticateJwt,
  validateRequest(courseIdParamSchema),
  CollegesController.getCourseById
);

// Institution profile details (Published only)
router.get(
  '/:id',
  optionalAuthenticateJwt,
  validateRequest(institutionIdParamSchema),
  CollegesController.getCollegeById
);

export { router as collegesRouter };

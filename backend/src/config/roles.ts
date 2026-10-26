/**
 * Platform User Roles and Access Control Matrix
 * Strictly consolidated to two application roles: Student and Admin.
 * Admin assumes all platform management, verification, and counselling operations.
 */

export enum Role {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
}

export const ROLES_LIST = Object.values(Role);

export interface RolePermissions {
  canAccessStudentIntake: boolean;
  canVerifyProfiles: boolean;
  canManagePlatformUsers: boolean;
  canViewAllProfiles: boolean;
}

export const ROLE_PERMISSIONS: Record<Role, RolePermissions> = {
  [Role.STUDENT]: {
    canAccessStudentIntake: true,
    canVerifyProfiles: false,
    canManagePlatformUsers: false,
    canViewAllProfiles: false,
  },
  [Role.ADMIN]: {
    canAccessStudentIntake: false,
    canVerifyProfiles: true,
    canManagePlatformUsers: true,
    canViewAllProfiles: true,
  },
};


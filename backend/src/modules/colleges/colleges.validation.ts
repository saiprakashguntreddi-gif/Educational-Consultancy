import { z } from 'zod';

export const listCollegesQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    department: z.string().optional(),
    course: z.string().optional(),
    specialization: z.string().optional(),
    level: z.string().optional(),
    minFee: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Number(val)), 'minFee must be a valid number'),
    maxFee: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Number(val)), 'maxFee must be a valid number'),
    hasScholarship: z
      .string()
      .optional()
      .refine(
        (val) => !val || val === 'true' || val === 'false' || val === '1' || val === '0',
        'hasScholarship must be boolean'
      ),
    entranceExam: z.string().optional(),
    page: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Number(val)), 'page must be a number'),
    limit: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Number(val)), 'limit must be a number'),
    sortBy: z.enum(['name_asc', 'name_desc', 'fee_asc', 'fee_desc']).optional(),
  }),
});

export const adminListCollegesQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.enum(['ALL', 'DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED']).optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    isVerified: z.string().optional(),
    isPublished: z.string().optional(),
    page: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Number(val)), 'page must be a number'),
    limit: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Number(val)), 'limit must be a number'),
    sortBy: z.string().optional(),
  }),
});

export const institutionIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Institution identifier is required'),
  }),
});

export const courseIdParamSchema = z.object({
  params: z.object({
    courseId: z.string().min(1, 'Course identifier is required'),
  }),
});

export const saveItemBodySchema = z.object({
  body: z.object({
    notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional().nullable(),
  }),
});

export const adminCreateInstitutionSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Institution name must have at least 2 characters'),
    country: z.string().min(2, 'Country is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().optional().nullable(),
    institutionType: z.string().optional().nullable(),
    establishedYear: z.number().int().optional().nullable(),
    overview: z.string().min(10, 'Overview must be at least 10 characters'),
    rankingInfo: z.string().optional().nullable(),
    campusFacilities: z.array(z.string()).optional().nullable(),
    placementInfo: z.string().optional().nullable(),
    admissionDeadlines: z.string().optional().nullable(),
    contactEmail: z.string().email('Invalid contact email').optional().nullable().or(z.literal('')),
    contactPhone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    officialWebsiteUrl: z.string().min(3, 'Official website URL is required'),
    hasScholarships: z.boolean().optional(),
    scholarshipDetails: z.string().optional().nullable(),
    minAnnualFee: z.number().optional().nullable(),
    maxAnnualFee: z.number().optional().nullable(),
    feeCurrency: z.string().optional().nullable(),
    status: z.enum(['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED']).optional(),
    isPublished: z.boolean().optional(),
    isVerified: z.boolean().optional(),
  }),
});

export const adminUpdateInstitutionSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Institution identifier is required'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    country: z.string().min(2).optional(),
    city: z.string().min(2).optional(),
    state: z.string().optional().nullable(),
    institutionType: z.string().optional().nullable(),
    establishedYear: z.number().int().optional().nullable(),
    overview: z.string().min(10).optional(),
    rankingInfo: z.string().optional().nullable(),
    campusFacilities: z.array(z.string()).optional().nullable(),
    placementInfo: z.string().optional().nullable(),
    admissionDeadlines: z.string().optional().nullable(),
    contactEmail: z.string().email().optional().nullable().or(z.literal('')),
    contactPhone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    officialWebsiteUrl: z.string().min(3).optional(),
    hasScholarships: z.boolean().optional(),
    scholarshipDetails: z.string().optional().nullable(),
    minAnnualFee: z.number().optional().nullable(),
    maxAnnualFee: z.number().optional().nullable(),
    feeCurrency: z.string().optional().nullable(),
    status: z.enum(['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED']).optional(),
    isPublished: z.boolean().optional(),
    isVerified: z.boolean().optional(),
  }),
});

export const adminPublishInstitutionSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Institution identifier is required'),
  }),
  body: z.object({
    isPublished: z.boolean(),
    status: z.enum(['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED']).optional(),
  }),
});

export const adminVerifyInstitutionSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Institution identifier is required'),
  }),
  body: z.object({
    isVerified: z.boolean(),
  }),
});

export const adminCreateCourseSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Institution identifier is required'),
  }),
  body: z.object({
    name: z.string().min(2, 'Course name is required'),
    department: z.string().min(2, 'Department is required'),
    specialization: z.string().optional().nullable(),
    level: z.string().optional().default('Undergraduate'),
    durationYears: z.number().optional().nullable(),
    durationText: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    eligibilityCriteria: z.string().optional().nullable(),
    annualTuitionFee: z.number().optional().nullable(),
    feeCurrency: z.string().optional().nullable().default('USD'),
    feeRange: z.string().optional().nullable(),
    entranceExamsRequired: z.array(z.string()).optional().nullable(),
    scholarshipAvailable: z.boolean().optional().default(false),
    scholarshipDetails: z.string().optional().nullable(),
    applicationDeadline: z.string().optional().nullable(),
    isPopular: z.boolean().optional().default(false),
    status: z.enum(['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED']).optional().default('PUBLISHED'),
    isPublished: z.boolean().optional().default(true),
  }),
});

export const adminUpdateCourseSchema = z.object({
  params: z.object({
    courseId: z.string().min(1, 'Course identifier is required'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    department: z.string().min(2).optional(),
    specialization: z.string().optional().nullable(),
    level: z.string().optional(),
    durationYears: z.number().optional().nullable(),
    durationText: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    eligibilityCriteria: z.string().optional().nullable(),
    annualTuitionFee: z.number().optional().nullable(),
    feeCurrency: z.string().optional().nullable(),
    feeRange: z.string().optional().nullable(),
    entranceExamsRequired: z.array(z.string()).optional().nullable(),
    scholarshipAvailable: z.boolean().optional(),
    scholarshipDetails: z.string().optional().nullable(),
    applicationDeadline: z.string().optional().nullable(),
    isPopular: z.boolean().optional(),
    status: z.enum(['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED']).optional(),
    isPublished: z.boolean().optional(),
  }),
});

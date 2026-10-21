import { z } from 'zod';

const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,20}$/;

export const updateContactGuardianSchema = z.object({
  body: z.object({
    primaryPhone: z
      .string()
      .min(7, 'Primary phone must have at least 7 digits')
      .max(25, 'Primary phone cannot exceed 25 characters')
      .regex(phoneRegex, 'Invalid phone number format')
      .optional(),
    alternateEmail: z
      .string()
      .email('Invalid alternate email format')
      .optional()
      .or(z.literal(''))
      .nullable(),
    guardianName: z
      .string()
      .max(120, 'Guardian name cannot exceed 120 characters')
      .optional()
      .nullable(),
    guardianRelationship: z
      .string()
      .max(50, 'Relationship cannot exceed 50 characters')
      .optional()
      .nullable(),
    guardianPhone: z
      .string()
      .max(25, 'Guardian phone cannot exceed 25 characters')
      .regex(phoneRegex, 'Invalid phone number format')
      .optional()
      .or(z.literal(''))
      .nullable(),
    guardianEmail: z
      .string()
      .email('Invalid guardian email format')
      .optional()
      .or(z.literal(''))
      .nullable(),
  }),
});

export const createActivitySchema = z.object({
  body: z.object({
    activityName: z
      .string({ required_error: 'Activity name is required' })
      .min(2, 'Activity name must be at least 2 characters')
      .max(150, 'Activity name cannot exceed 150 characters'),
    category: z
      .string({ required_error: 'Activity category is required' })
      .min(2, 'Category must be at least 2 characters')
      .max(80, 'Category cannot exceed 80 characters'),
    organization: z.string().max(150).optional().nullable(),
    period: z.string().max(80).optional().nullable(),
    description: z
      .string({ required_error: 'Description of involvement is required' })
      .min(3, 'Description must be at least 3 characters')
      .max(1500, 'Description cannot exceed 1500 characters'),
    recognition: z.string().max(300).optional().nullable(),
  }),
});

export const updateActivitySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid activity ID format'),
  }),
  body: z.object({
    activityName: z.string().min(2).max(150).optional(),
    category: z.string().min(2).max(80).optional(),
    organization: z.string().max(150).optional().nullable(),
    period: z.string().max(80).optional().nullable(),
    description: z.string().min(3).max(1500).optional(),
    recognition: z.string().max(300).optional().nullable(),
  }),
});

export const createAchievementSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Achievement title is required' })
      .min(2, 'Achievement title must be at least 2 characters')
      .max(150, 'Achievement title cannot exceed 150 characters'),
    category: z
      .string({ required_error: 'Category is required' })
      .min(2, 'Category must be at least 2 characters')
      .max(80, 'Category cannot exceed 80 characters'),
    issuer: z.string().max(150).optional().nullable(),
    dateYear: z.string().max(60).optional().nullable(),
    description: z.string().max(1500).optional().nullable(),
    certificateUrl: z.string().max(500).optional().nullable(),
  }),
});

export const updateAchievementSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid achievement ID format'),
  }),
  body: z.object({
    title: z.string().min(2).max(150).optional(),
    category: z.string().min(2).max(80).optional(),
    issuer: z.string().max(150).optional().nullable(),
    dateYear: z.string().max(60).optional().nullable(),
    description: z.string().max(1500).optional().nullable(),
    certificateUrl: z.string().max(500).optional().nullable(),
  }),
});

export const deleteItemSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid item ID format'),
  }),
});

export const getPersonalByProfileIdSchema = z.object({
  params: z.object({
    studentProfileId: z.string().uuid('Invalid student profile ID format'),
  }),
});

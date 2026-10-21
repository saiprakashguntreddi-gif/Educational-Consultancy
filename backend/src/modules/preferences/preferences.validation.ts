import { z } from 'zod';

export const departmentPreferencePairSchema = z.object({
  department: z.string().trim().min(1, 'Department is required'),
  subDepartment: z.string().trim().min(1, 'Course / Specialization is required'),
});

export const savePreferencesSchema = z.object({
  body: z
    .object({
      countries: z
        .array(z.string().trim())
        .max(25, 'Maximum 25 destination countries can be selected')
        .optional()
        .default([]),
      countriesNotFinalized: z.boolean().optional().default(false),
      primaryCountry: z
        .string()
        .trim()
        .optional(),
      department: z
        .string()
        .trim()
        .optional()
        .default(''),
      subDepartment: z
        .string()
        .trim()
        .optional()
        .default(''),
      coursesNotFinalized: z.boolean().optional().default(false),
      departmentPreferences: z
        .array(departmentPreferencePairSchema)
        .optional()
        .default([]),
    })
    .refine(
      (data) => {
        if (!data.countriesNotFinalized && (!data.countries || data.countries.length === 0)) {
          return false;
        }
        return true;
      },
      {
        message: 'At least one priority country must be selected or marked as not finalized',
        path: ['countries'],
      }
    )
    .refine(
      (data) => {
        if (
          !data.coursesNotFinalized &&
          !data.department &&
          (!data.departmentPreferences || data.departmentPreferences.length === 0)
        ) {
          return false;
        }
        return true;
      },
      {
        message: 'At least one department and course must be selected or marked as not finalized',
        path: ['department'],
      }
    ),
});

export const getPreferencesByProfileIdSchema = z.object({
  params: z.object({
    studentProfileId: z.string().uuid('Invalid profile ID format'),
  }),
});

export type SavePreferencesDto = z.infer<typeof savePreferencesSchema>['body'];
export type DepartmentPreferencePair = z.infer<typeof departmentPreferencePairSchema>;

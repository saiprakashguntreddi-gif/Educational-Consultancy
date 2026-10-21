import { z } from 'zod';

export const saveEducationSchema = z.object({
  body: z.object({
    // 12th / Senior Secondary (Primary)
    schoolName: z
      .string({ required_error: 'School or Institution name is required' })
      .trim()
      .min(2, 'School name must be at least 2 characters')
      .max(150, 'School name must not exceed 150 characters'),
    board: z
      .string({ required_error: '12th Board/Curriculum is required' })
      .trim()
      .min(2, 'Board must be at least 2 characters')
      .max(80, 'Board must not exceed 80 characters'),
    completionYear: z.coerce
      .number({ required_error: 'Completion year is required' })
      .int('Completion year must be an integer')
      .min(1990, 'Completion year must be 1990 or later')
      .max(2035, 'Completion year must not exceed 2035'),
    percentage: z.coerce
      .number({ required_error: 'Percentage or aggregate score is required' })
      .min(0, 'Percentage cannot be negative')
      .max(100, 'Percentage cannot exceed 100'),
    subjectDetails: z
      .array(
        z.object({
          subject: z
            .string({ required_error: 'Subject name is required' })
            .trim()
            .min(1, 'Subject name cannot be empty'),
          score: z.coerce
            .number({ required_error: 'Subject score is required' })
            .min(0, 'Score cannot be negative')
            .max(100, 'Score cannot exceed 100'),
        })
      )
      .min(1, 'At least one subject detail must be specified'),

    // 10th / Secondary School (Optional)
    tenthSchoolName: z
      .string()
      .trim()
      .max(150, '10th School name must not exceed 150 characters')
      .optional()
      .or(z.literal('')),
    tenthBoard: z
      .string()
      .trim()
      .max(80, '10th Board must not exceed 80 characters')
      .optional()
      .or(z.literal('')),
    tenthPassingYear: z.coerce
      .number()
      .int('Passing year must be an integer')
      .min(1980, 'Year must be 1980 or later')
      .max(2035, 'Year must not exceed 2035')
      .optional()
      .nullable(),
    tenthPercentage: z.coerce
      .number()
      .min(0, 'Percentage cannot be negative')
      .max(100, 'Percentage cannot exceed 100')
      .optional()
      .nullable(),
  }),
});

export const getEducationByProfileIdSchema = z.object({
  params: z.object({
    studentProfileId: z
      .string({ required_error: 'Student Profile ID is required' })
      .uuid('Invalid Student Profile ID format'),
  }),
});

import { z } from 'zod';

export const bookAppointmentSchema = z.object({
  body: z.object({
    appointmentType: z.enum([
      'CAREER_COUNSELLING',
      'COLLEGE_ADMISSION',
      'COURSE_SELECTION',
      'SCHOLARSHIP_GUIDANCE',
      'GENERAL_CONSULTATION',
    ]),
    counsellorId: z.string().min(1, 'Counsellor is required'),
    scheduledDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    timeSlot: z.string().min(1, 'Time slot is required'),
    meetingType: z.enum(['ONLINE_COUNSELLING', 'IN_PERSON', 'PHONE']).default('ONLINE_COUNSELLING'),
    relatedCollegeId: z.string().optional(),
    relatedCollegeName: z.string().optional(),
    studentNotes: z.string().max(1000).optional(),
  }),
});

export const cancelAppointmentSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    reason: z.string().max(500).optional(),
  }),
});

export const toggleShortlistSchema = z.object({
  body: z.object({
    institutionId: z.string().min(1, 'Institution ID is required'),
    fitCategory: z.enum(['DREAM', 'REACH', 'SAFE', 'TARGET']).optional().default('TARGET'),
    priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional().default('MEDIUM'),
    notes: z.string().max(500).optional(),
  }),
});

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

export const updateAppointmentStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    status: z.enum(['CONFIRMED', 'RESCHEDULED', 'CANCELLED']),
    reason: z.string().max(500).optional(),
    scheduledDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .optional(),
    timeSlot: z.string().optional(),
    meetingLocation: z.string().optional(),
  }),
});

export const recordSessionOutcomeSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    actualStartTime: z.string().optional(),
    actualEndTime: z.string().optional(),
    durationMinutes: z.number().int().min(1).optional(),
    sessionOutcome: z.string().min(2, 'Session topic/outcome summary required'),
    recommendations: z.string().optional(),
    followUpRequired: z.boolean().optional().default(false),
    nextAction: z.string().optional(),
    followUpActions: z.string().optional(),
    privateCounsellorNotes: z.string().optional(),
    studentInterest: z.enum(['INTERESTED', 'NOT_INTERESTED', 'UNDECIDED']).optional().default('UNDECIDED'),
    targetStream: z.string().optional(),
    targetDepartments: z.string().optional(),
    targetColleges: z.string().optional(),
    targetCity: z.string().optional(),
    studyScope: z.enum(['DOMESTIC', 'INTERNATIONAL', 'BOTH']).optional().default('INTERNATIONAL'),
    detailedInterestReport: z.string().optional(),
    sendPolicyViaWhatsApp: z.boolean().optional().default(false),
  }),
});

export const sendReminderSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    method: z.enum(['WHATSAPP', 'SMS']).default('WHATSAPP'),
  }),
});

export const manageCounsellorSlotsSchema = z.object({
  body: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    timeSlots: z.array(z.string()).min(1, 'At least one time slot is required'),
  }),
});

export const enrollStudentSchema = z.object({
  body: z.object({
    studentProfileId: z.string().optional(),
    counsellorId: z.string().optional(),
    targetCollege: z.string().optional(),
    targetStream: z.string().optional(),
    agreementSigned: z.boolean().default(true),
  }),
});



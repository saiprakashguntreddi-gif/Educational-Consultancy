export type AppointmentType =
  | 'CAREER_COUNSELLING'
  | 'COLLEGE_ADMISSION'
  | 'COURSE_SELECTION'
  | 'SCHOLARSHIP_GUIDANCE'
  | 'GENERAL_CONSULTATION';

export type MeetingMode = 'ONLINE_COUNSELLING' | 'IN_PERSON' | 'PHONE';

export type AppointmentStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RESCHEDULED';

export interface CounsellorSummary {
  id: string;
  email: string;
  fullName: string;
  role: string;
  specialization?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface BookAppointmentInput {
  appointmentType: AppointmentType;
  counsellorId: string;
  scheduledDate: string; // YYYY-MM-DD
  timeSlot: string;      // e.g. "10:00 AM" or "14:00"
  meetingType: MeetingMode;
  relatedCollegeId?: string;
  relatedCollegeName?: string;
  studentNotes?: string;
}

export interface AppointmentDto {
  id: string;
  title: string;
  description?: string | null;
  appointmentType: AppointmentType;
  scheduledAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  meetingType: MeetingMode;
  meetingLocation?: string | null;
  relatedCollegeId?: string | null;
  relatedCollegeName?: string | null;
  studentNotes?: string | null;
  studentProfileId: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string | null;
  counsellorId: string;
  counsellorName: string;
  counsellorEmail: string;
  attachments?: string | null;
  followUpActions?: string | null;
  cancellationReason?: string | null;
  cancelledAt?: string | null;
  studentInterest?: 'INTERESTED' | 'NOT_INTERESTED' | 'UNDECIDED' | null;
  targetStream?: string | null;
  targetDepartments?: string | null;
  targetColleges?: string | null;
  targetCity?: string | null;
  studyScope?: 'DOMESTIC' | 'INTERNATIONAL' | 'BOTH' | null;
  detailedInterestReport?: string | null;
  reminderSentAt?: string | null;
  reminderSentVia?: string | null;
  isRecorded?: boolean;
  recordingUrl?: string | null;
  sessionOutcome?: string | null;
  recommendations?: string | null;
  followUpRequired?: boolean;
  nextAction?: string | null;
  createdAt: string;
}

export interface SlotAvailabilityDto {
  date: string;
  timeSlot: string;
  isAvailable: boolean;
  isBooked: boolean;
}

export interface StudentEnrollmentDto {
  id: string;
  studentProfileId: string;
  counsellorId: string;
  status: string;
  pointsAwarded: number;
  agreementSigned: boolean;
  targetCollege?: string | null;
  targetStream?: string | null;
  enrolledAt: string;
}


export interface WebinarDto {
  id: string;
  title: string;
  description: string;
  speakerName?: string | null;
  speakerTitle?: string | null;
  speakerBio?: string | null;
  topic: string;
  destinationCountry?: string | null;
  webinarType: 'UPCOMING' | 'RECORDED';
  scheduledAt?: string | null;
  durationMinutes: number;
  officialLink: string;
  recordingUrl?: string | null;
  bannerUrl?: string | null;
  isRegistered: boolean;
  registeredCount: number;
  registeredAt?: string | null;
}

export interface ShortlistedCollegeDto {
  id: string; // shortlistItem id or institution id
  institutionId: string;
  name: string;
  country: string;
  city: string;
  tier: string;
  fitCategory: 'DREAM' | 'REACH' | 'SAFE' | 'TARGET';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  acceptanceRate?: string;
  avgTuitionFee?: string;
  notes?: string | null;
  shortlistedAt: string;
}

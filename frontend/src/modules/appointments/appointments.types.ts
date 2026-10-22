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
  counsellorId: string;
  counsellorName: string;
  counsellorEmail: string;
  attachments?: string | null;
  followUpActions?: string | null;
  cancellationReason?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
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
  id: string;
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

export interface AppointmentsMetaResponse {
  counsellors: CounsellorSummary[];
  appointmentTypes: {
    type: AppointmentType;
    label: string;
    description: string;
    durationMinutes: number;
    icon: string;
  }[];
  meetingModes: {
    mode: MeetingMode;
    label: string;
    description: string;
  }[];
  timeSlots: string[];
  shortlistedColleges: ShortlistedCollegeDto[];
}

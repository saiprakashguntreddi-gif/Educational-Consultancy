import { prisma } from '../../shared/database/prisma.service';
import { Role } from '../../config/roles';
import {
  BookAppointmentInput,
  AppointmentDto,
  WebinarDto,
  ShortlistedCollegeDto,
} from './appointments.types';
import {
  DEFAULT_TIME_SLOTS,
  APPOINTMENT_TYPES_META,
  SEED_WEBINARS,
} from './appointments.data';

export class AppointmentsService {
  private static isSeeded = false;

  /**
   * Ensure webinars and default counsellors exist
   */
  public static async ensureSeedData(): Promise<void> {
    if (this.isSeeded) return;

    try {
      // 1. Seed Webinars if table is empty
      const webinarCount = await prisma.webinar.count();
      if (webinarCount === 0) {
        const webinarsToCreate = SEED_WEBINARS.map((seed) => {
          const scheduledAt = new Date();
          scheduledAt.setDate(scheduledAt.getDate() + seed.scheduledDaysFromNow);
          scheduledAt.setHours(seed.scheduledHour, 0, 0, 0);

          return {
            title: seed.title,
            description: seed.description,
            speakerName: seed.speakerName,
            speakerTitle: seed.speakerTitle,
            speakerBio: seed.speakerBio,
            topic: seed.topic,
            destinationCountry: seed.destinationCountry,
            webinarType: seed.webinarType,
            scheduledAt,
            durationMinutes: seed.durationMinutes,
            officialLink: seed.officialLink,
            recordingUrl: seed.recordingUrl,
            bannerUrl: seed.bannerUrl,
            isPublished: seed.isPublished,
            publishedAt: new Date(),
          };
        });
        await prisma.webinar.createMany({ data: webinarsToCreate });
      }

      // 2. Ensure at least one Counsellor user exists
      const counsellorCount = await prisma.user.count({
        where: { role: Role.COUNSELLOR },
      });

      if (counsellorCount === 0) {
        // Find existing counsellor or create
        await prisma.user.upsert({
          where: { email: 'counsellor@superconsciousness.internal' },
          update: { role: Role.COUNSELLOR },
          create: {
            email: 'counsellor@superconsciousness.internal',
            passwordHash: '$2b$10$w0...demo', // hash
            role: Role.COUNSELLOR,
            isActive: true,
            isEmailVerified: true,
          },
        });
      }

      this.isSeeded = true;
    } catch (err) {
      console.error('[Module 12: AppointmentsService] ensureSeedData error:', err);
    }
  }

  /**
   * Helper: Get student profile by user ID
   */
  private static async getStudentProfile(userId: string) {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        assignedCounsellor: { select: { id: true, email: true } },
      },
    });

    if (!profile) {
      const err: any = new Error('Student profile not found. Please complete your profile intake first.');
      err.statusCode = 404;
      throw err;
    }

    return profile;
  }

  /**
   * 1. Get Appointments Metadata (Counsellors, Types, Slots)
   */
  public static async getMeta(userId: string) {
    await this.ensureSeedData();

    const profile = await this.getStudentProfile(userId);

    // Fetch active counsellors with full profile
    const counsellors = await prisma.user.findMany({
      where: { role: Role.COUNSELLOR, isActive: true },
      include: {
        counsellorProfile: true,
      },
    });

    const counsellorList = counsellors.map((c) => {
      const isAssigned = profile.assignedCounsellorId === c.id;
      let parsedSkills: string[] = [];
      try {
        parsedSkills = c.counsellorProfile?.skills ? JSON.parse(c.counsellorProfile.skills) : [];
      } catch {
        parsedSkills = ['Career Guidance', 'Admissions'];
      }

      return {
        id: c.id,
        email: c.email,
        fullName: c.counsellorProfile?.fullName || (isAssigned ? 'Assigned Lead Counsellor' : `Academic Advisor (${c.email.split('@')[0]})`),
        role: 'Certified Educational Counsellor',
        specialization: c.counsellorProfile?.specialization || 'Undergraduate Admissions & STEM Pathways',
        skills: parsedSkills,
        experienceYears: c.counsellorProfile?.experienceYears || 3,
        bio: c.counsellorProfile?.bio || 'Expert consultant specializing in college evaluation, profile spikes, and university admissions.',
        availability: c.counsellorProfile?.availability || 'Mon-Fri, 9:00 AM - 5:00 PM',
        verificationStatus: c.counsellorProfile?.verificationStatus || 'ACTIVE',
        isAssigned,
      };
    });

    // Resolve student's designated assigned counsellor
    const assignedCounsellorObj = counsellorList.find((c) => c.isAssigned) || null;

    // Also get student's shortlisted colleges to populate the context selector
    const shortlist = await this.listShortlistedColleges(userId);

    return {
      assignedCounsellor: assignedCounsellorObj,
      studentInfo: {
        fullName: profile.fullName,
        email: profile.contactEmail,
        grade: profile.grade,
        assignedCounsellorId: profile.assignedCounsellorId,
        assignedCounsellor: assignedCounsellorObj,
      },
      counsellors: counsellorList,
      appointmentTypes: APPOINTMENT_TYPES_META,
      availableTimeSlots: DEFAULT_TIME_SLOTS,
      shortlistedColleges: shortlist.map((s) => ({
        id: s.institutionId,
        name: s.name,
        country: s.country,
        city: s.city,
        tier: s.tier,
      })),
    };
  }

  /**
   * 2. List Student's Appointments
   */
  public static async getMyAppointments(userId: string): Promise<AppointmentDto[]> {
    const profile = await this.getStudentProfile(userId);

    const appointments = await prisma.appointment.findMany({
      where: { studentProfileId: profile.id },
      include: {
        counsellor: { select: { id: true, email: true } },
        studentProfile: { select: { fullName: true, contactEmail: true } },
      },
      orderBy: { scheduledAt: 'desc' },
    });

    return appointments.map((apt) => ({
      id: apt.id,
      title: apt.title,
      description: apt.description,
      appointmentType: (apt.appointmentType as any) || 'GENERAL_CONSULTATION',
      scheduledAt: apt.scheduledAt.toISOString(),
      durationMinutes: apt.durationMinutes,
      status: (apt.status as any) || 'SCHEDULED',
      meetingType: (apt.meetingType as any) || 'ONLINE_COUNSELLING',
      meetingLocation: apt.meetingLocation,
      relatedCollegeId: apt.relatedCollegeId,
      relatedCollegeName: apt.relatedCollegeName,
      studentNotes: apt.studentNotes,
      studentProfileId: apt.studentProfileId,
      studentName: apt.studentProfile.fullName,
      studentEmail: apt.studentProfile.contactEmail,
      studentPhone: (apt.studentProfile as any)?.phone || null,
      counsellorId: apt.counsellorId,
      counsellorName: `Counsellor (${apt.counsellor.email.split('@')[0]})`,
      counsellorEmail: apt.counsellor.email,
      attachments: apt.attachments,
      followUpActions: apt.followUpActions,
      cancellationReason: apt.cancellationReason,
      cancelledAt: apt.cancelledAt?.toISOString() || null,
      studentInterest: (apt as any).studentInterest || null,
      targetStream: (apt as any).targetStream || null,
      targetDepartments: (apt as any).targetDepartments || null,
      targetColleges: (apt as any).targetColleges || null,
      targetCity: (apt as any).targetCity || null,
      studyScope: (apt as any).studyScope || null,
      detailedInterestReport: (apt as any).detailedInterestReport || null,
      reminderSentAt: (apt as any).reminderSentAt?.toISOString() || null,
      reminderSentVia: (apt as any).reminderSentVia || null,
      isRecorded: Boolean((apt as any).isRecorded),
      recordingUrl: (apt as any).recordingUrl || null,
      sessionOutcome: apt.sessionOutcome,
      recommendations: apt.recommendations,
      followUpRequired: apt.followUpRequired,
      nextAction: apt.nextAction,
      createdAt: apt.createdAt.toISOString(),
    }));
  }

  /**
   * 3. Book an Appointment
   */
  public static async bookAppointment(
    userId: string,
    input: BookAppointmentInput
  ): Promise<AppointmentDto> {
    const profile = await this.getStudentProfile(userId);

    // Business Requirement: Student must be verified by admin before booking appointments
    if (profile.verificationStatus !== 'VERIFIED') {
      const err: any = new Error(
        'Appointment booking is restricted until your student profile and educational certificates are verified by an administrator. Please submit My Profile, Preferences, and Education details with required documents for verification.'
      );
      err.statusCode = 403;
      throw err;
    }

    // Business Requirement: If student has an assigned counsellor, book ONLY with that counsellor
    if (profile.assignedCounsellorId && input.counsellorId !== profile.assignedCounsellorId) {
      const err: any = new Error(
        'Appointments can only be scheduled with your dedicated assigned counsellor. Please select your assigned counsellor.'
      );
      err.statusCode = 403;
      throw err;
    }

    if (!profile.assignedCounsellorId) {
      // If student is not yet assigned a counsellor, verify selected counsellor is active and verified
      const targetCounsellor = await prisma.user.findFirst({
        where: { id: input.counsellorId, role: Role.COUNSELLOR, isActive: true },
        include: { counsellorProfile: true },
      });
      if (!targetCounsellor) {
        const err: any = new Error('Selected counsellor is not active or available.');
        err.statusCode = 404;
        throw err;
      }
      const cStatus = targetCounsellor.counsellorProfile?.verificationStatus || (targetCounsellor.isActive ? 'ACTIVE' : 'PENDING');
      if (cStatus !== 'ACTIVE' && cStatus !== 'VERIFIED') {
        const err: any = new Error('Selected counsellor is currently not verified or eligible for appointments.');
        err.statusCode = 400;
        throw err;
      }
    }

    // Validate counsellor exists and has counsellor role
    const counsellor = await prisma.user.findFirst({
      where: { id: input.counsellorId, role: Role.COUNSELLOR, isActive: true },
      include: { counsellorProfile: true },
    });

    if (!counsellor) {
      const err: any = new Error('Selected counsellor is not active or available.');
      err.statusCode = 404;
      throw err;
    }

    // Parse date and time
    // input.scheduledDate = "2026-10-25", input.timeSlot = "10:00 AM" or "14:00"
    const parsedDateTime = this.parseDateAndSlot(input.scheduledDate, input.timeSlot);
    if (!parsedDateTime || isNaN(parsedDateTime.getTime())) {
      const err: any = new Error('Invalid appointment date or time slot format.');
      err.statusCode = 400;
      throw err;
    }

    // Validate scheduled date is in the future
    const now = new Date();
    if (parsedDateTime.getTime() <= now.getTime()) {
      const err: any = new Error('Appointment date and time must be in the future. Past bookings are strictly not permitted.');
      err.statusCode = 400;
      throw err;
    }

    // Check counsellor duplicate booking in this slot (within 40 mins window)
    const slotStart = new Date(parsedDateTime.getTime() - 20 * 60000);
    const slotEnd = new Date(parsedDateTime.getTime() + 40 * 60000);

    const counsellorClash = await prisma.appointment.findFirst({
      where: {
        counsellorId: input.counsellorId,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        scheduledAt: { gte: slotStart, lte: slotEnd },
      },
    });

    if (counsellorClash) {
      const err: any = new Error(
        `This counsellor already has a confirmed booking at ${input.timeSlot} on ${input.scheduledDate}. Please select another time slot.`
      );
      err.statusCode = 409;
      throw err;
    }

    // Check student duplicate booking in this slot
    const studentClash = await prisma.appointment.findFirst({
      where: {
        studentProfileId: profile.id,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        scheduledAt: { gte: slotStart, lte: slotEnd },
      },
    });

    if (studentClash) {
      const err: any = new Error(
        `You already have an appointment scheduled at ${input.timeSlot} on ${input.scheduledDate}. Please choose a different date or slot.`
      );
      err.statusCode = 409;
      throw err;
    }

    // Resolve appointment type metadata
    const typeMeta = APPOINTMENT_TYPES_META.find((t) => t.type === input.appointmentType) || {
      title: 'Consultancy Guidance Session',
      durationMinutes: 45,
    };

    // Meeting Location
    const meetingLocation =
      input.meetingType === 'ONLINE_COUNSELLING'
        ? 'Google Meet (Official link will be sent to your registered email)'
        : input.meetingType === 'IN_PERSON'
        ? 'Superconsciousness Academic Advising Centre, Main Suite 402'
        : 'Direct Telephone Consultation';

    // Create Appointment
    const appointment = await prisma.appointment.create({
      data: {
        title: `${typeMeta.title} with ${profile.fullName}`,
        description: input.studentNotes || `1-on-1 ${typeMeta.title} regarding higher education pathways.`,
        appointmentType: input.appointmentType,
        scheduledAt: parsedDateTime,
        durationMinutes: typeMeta.durationMinutes,
        status: 'SCHEDULED',
        meetingType: input.meetingType,
        meetingLocation,
        relatedCollegeId: input.relatedCollegeId || null,
        relatedCollegeName: input.relatedCollegeName || null,
        studentNotes: input.studentNotes || null,
        studentProfileId: profile.id,
        counsellorId: counsellor.id,
        isRecorded: true,
        recordingUrl: '/assets/sample-consultation.mp4',
        followUpActions: 'Please review your Education Details and keep your shortlisted colleges ready prior to the meeting.',
      },
      include: {
        counsellor: { select: { id: true, email: true } },
        studentProfile: { select: { fullName: true, contactEmail: true } },
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'APPOINTMENT_BOOKED',
        details: JSON.stringify({
          appointmentId: appointment.id,
          type: appointment.appointmentType,
          scheduledAt: appointment.scheduledAt,
          counsellorId: counsellor.id,
        }),
      },
    }).catch(() => {});

    return {
      id: appointment.id,
      title: appointment.title,
      description: appointment.description,
      appointmentType: appointment.appointmentType as any,
      scheduledAt: appointment.scheduledAt.toISOString(),
      durationMinutes: appointment.durationMinutes,
      status: appointment.status as any,
      meetingType: appointment.meetingType as any,
      meetingLocation: appointment.meetingLocation,
      relatedCollegeId: appointment.relatedCollegeId,
      relatedCollegeName: appointment.relatedCollegeName,
      studentNotes: appointment.studentNotes,
      studentProfileId: appointment.studentProfileId,
      studentName: appointment.studentProfile.fullName,
      studentEmail: appointment.studentProfile.contactEmail,
      counsellorId: appointment.counsellorId,
      counsellorName: `Counsellor (${counsellor.email.split('@')[0]})`,
      counsellorEmail: counsellor.email,
      followUpActions: appointment.followUpActions,
      createdAt: appointment.createdAt.toISOString(),
    };
  }

  /**
   * 4. Cancel Appointment (Student)
   */
  public static async cancelAppointment(
    userId: string,
    appointmentId: string,
    reason?: string
  ): Promise<AppointmentDto> {
    const profile = await this.getStudentProfile(userId);

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        counsellor: { select: { id: true, email: true } },
        studentProfile: { select: { fullName: true, contactEmail: true, userId: true } },
      },
    });

    if (!appointment) {
      const err: any = new Error('Appointment not found.');
      err.statusCode = 404;
      throw err;
    }

    if (appointment.studentProfileId !== profile.id) {
      const err: any = new Error('Unauthorized to cancel this appointment.');
      err.statusCode = 403;
      throw err;
    }

    if (appointment.status === 'CANCELLED') {
      const err: any = new Error('This appointment has already been cancelled.');
      err.statusCode = 400;
      throw err;
    }

    if (appointment.status === 'COMPLETED') {
      const err: any = new Error('Completed appointments cannot be cancelled.');
      err.statusCode = 400;
      throw err;
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: reason?.trim() || 'Cancelled by student',
      },
      include: {
        counsellor: { select: { id: true, email: true } },
        studentProfile: { select: { fullName: true, contactEmail: true } },
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'APPOINTMENT_CANCELLED',
        details: JSON.stringify({ appointmentId, reason }),
      },
    }).catch(() => {});

    return {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      appointmentType: updated.appointmentType as any,
      scheduledAt: updated.scheduledAt.toISOString(),
      durationMinutes: updated.durationMinutes,
      status: updated.status as any,
      meetingType: updated.meetingType as any,
      meetingLocation: updated.meetingLocation,
      relatedCollegeId: updated.relatedCollegeId,
      relatedCollegeName: updated.relatedCollegeName,
      studentNotes: updated.studentNotes,
      studentProfileId: updated.studentProfileId,
      studentName: updated.studentProfile.fullName,
      studentEmail: updated.studentProfile.contactEmail,
      counsellorId: updated.counsellorId,
      counsellorName: `Counsellor (${updated.counsellor.email.split('@')[0]})`,
      counsellorEmail: updated.counsellor.email,
      cancellationReason: updated.cancellationReason,
      cancelledAt: updated.cancelledAt?.toISOString() || null,
      createdAt: updated.createdAt.toISOString(),
    };
  }

  /**
   * Counsellor: Get all appointments for the logged-in counsellor
   */
  public static async getCounsellorSchedule(counsellorId: string) {
    const appointments = await prisma.appointment.findMany({
      where: { counsellorId },
      include: {
        studentProfile: {
          select: {
            id: true,
            fullName: true,
            contactEmail: true,
            phone: true,
            grade: true,
            board: true,
            preference: true,
          },
        },
        counsellor: {
          select: {
            id: true,
            email: true,
            counsellorProfile: true,
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    return appointments.map((apt) => ({
      id: apt.id,
      title: apt.title,
      description: apt.description,
      appointmentType: apt.appointmentType,
      scheduledAt: apt.scheduledAt.toISOString(),
      durationMinutes: apt.durationMinutes,
      status: apt.status,
      meetingType: apt.meetingType,
      meetingMode: apt.meetingType ? apt.meetingType.replace('_', ' ') : 'Online Video',
      meetingLocation: apt.meetingLocation,
      studentProfileId: apt.studentProfileId,
      studentName: apt.studentProfile.fullName,
      studentEmail: apt.studentProfile.contactEmail,
      studentPhone: apt.studentProfile.phone,
      studentGrade: apt.studentProfile.grade,
      studentProfile: {
        id: apt.studentProfile.id,
        fullName: apt.studentProfile.fullName,
        contactEmail: apt.studentProfile.contactEmail,
        phone: apt.studentProfile.phone,
        grade: apt.studentProfile.grade,
        board: apt.studentProfile.board,
      },
      studentNotes: apt.studentNotes,
      relatedCollegeName: apt.relatedCollegeName,
      counsellorId: apt.counsellorId,
      counsellorEmail: apt.counsellor?.email,
      actualStartTime: apt.actualStartTime?.toISOString() || null,
      actualEndTime: apt.actualEndTime?.toISOString() || null,
      sessionOutcome: apt.sessionOutcome,
      recommendations: apt.recommendations,
      followUpRequired: apt.followUpRequired,
      nextAction: apt.nextAction,
      followUpActions: apt.followUpActions,
      privateCounsellorNotes: apt.privateCounsellorNotes,
      completedAt: apt.completedAt?.toISOString() || null,
      cancelledAt: apt.cancelledAt?.toISOString() || null,
      cancellationReason: apt.cancellationReason,
      studentInterest: (apt as any).studentInterest || null,
      targetStream: (apt as any).targetStream || null,
      targetDepartments: (apt as any).targetDepartments || null,
      targetColleges: (apt as any).targetColleges || null,
      targetCity: (apt as any).targetCity || null,
      studyScope: (apt as any).studyScope || null,
      detailedInterestReport: (apt as any).detailedInterestReport || null,
      reminderSentAt: (apt as any).reminderSentAt?.toISOString() || null,
      reminderSentVia: (apt as any).reminderSentVia || null,
      isRecorded: Boolean((apt as any).isRecorded),
      recordingUrl: (apt as any).recordingUrl || null,
      createdAt: apt.createdAt.toISOString(),
    }));
  }

  /**
   * Counsellor: Accept, Reschedule, or Decline an appointment request
   */
  public static async updateAppointmentStatusByCounsellor(
    counsellorId: string,
    appointmentId: string,
    input: {
      status: 'CONFIRMED' | 'RESCHEDULED' | 'CANCELLED';
      reason?: string;
      scheduledDate?: string;
      timeSlot?: string;
      meetingLocation?: string;
    },
    userRole?: string
  ) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        counsellor: { select: { id: true, email: true } },
        studentProfile: { select: { id: true, fullName: true, contactEmail: true, userId: true } },
      },
    });

    if (!appointment) {
      const err: any = new Error('Appointment not found.');
      err.statusCode = 404;
      throw err;
    }

    // Role check: must be the assigned counsellor or an Admin
    if (userRole !== Role.ADMIN && appointment.counsellorId !== counsellorId) {
      const err: any = new Error('Unauthorized to manage this appointment.');
      err.statusCode = 403;
      throw err;
    }

    const updateData: any = {
      status: input.status,
    };

    if (input.status === 'CONFIRMED') {
      // Ensure meeting room link is active
      const meetingLink =
        input.meetingLocation ||
        appointment.meetingLocation ||
        `https://meet.superconsciousness.internal/counselling/${appointment.id.slice(0, 8)}`;
      updateData.meetingLocation = meetingLink;
    } else if (input.status === 'RESCHEDULED') {
      if (input.scheduledDate && input.timeSlot) {
        const newDate = this.parseDateAndSlot(input.scheduledDate, input.timeSlot);
        if (newDate && !isNaN(newDate.getTime())) {
          updateData.scheduledAt = newDate;
        }
      }
      if (input.reason) {
        updateData.cancellationReason = `Rescheduled: ${input.reason}`;
      }
    } else if (input.status === 'CANCELLED') {
      updateData.cancelledAt = new Date();
      updateData.cancellationReason = input.reason || 'Declined by counsellor';
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: updateData,
      include: {
        counsellor: { select: { id: true, email: true } },
        studentProfile: { select: { id: true, fullName: true, contactEmail: true } },
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: counsellorId,
        action: `APPOINTMENT_${input.status}`,
        details: JSON.stringify({ appointmentId, newStatus: input.status, reason: input.reason || null }),
      },
    }).catch(() => {});

    return {
      id: updated.id,
      title: updated.title,
      scheduledAt: updated.scheduledAt.toISOString(),
      status: updated.status,
      meetingLocation: updated.meetingLocation,
      cancellationReason: updated.cancellationReason,
      cancelledAt: updated.cancelledAt?.toISOString() || null,
      studentName: updated.studentProfile.fullName,
      studentEmail: updated.studentProfile.contactEmail,
    };
  }

  /**
   * Counsellor: Record meeting completion, session outcome, notes, interest report, and follow-up flags
   */
  public static async recordSessionOutcome(
    counsellorId: string,
    appointmentId: string,
    input: {
      actualStartTime?: string;
      actualEndTime?: string;
      durationMinutes?: number;
      sessionOutcome: string;
      recommendations?: string;
      followUpRequired?: boolean;
      nextAction?: string;
      followUpActions?: string;
      privateCounsellorNotes?: string;
      studentInterest?: 'INTERESTED' | 'NOT_INTERESTED' | 'UNDECIDED';
      targetStream?: string;
      targetDepartments?: string;
      targetColleges?: string;
      targetCity?: string;
      studyScope?: 'DOMESTIC' | 'INTERNATIONAL' | 'BOTH';
      detailedInterestReport?: string;
      sendPolicyViaWhatsApp?: boolean;
    },
    userRole?: string
  ) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        studentProfile: true,
        counsellor: { select: { id: true, email: true } },
      },
    });

    if (!appointment) {
      const err: any = new Error('Appointment not found.');
      err.statusCode = 404;
      throw err;
    }

    if (userRole !== Role.ADMIN && appointment.counsellorId !== counsellorId) {
      const err: any = new Error('Unauthorized to record session outcome for this appointment.');
      err.statusCode = 403;
      throw err;
    }

    const startTime = input.actualStartTime ? new Date(input.actualStartTime) : appointment.scheduledAt;
    const endTime = input.actualEndTime ? new Date(input.actualEndTime) : new Date();
    const duration = input.durationMinutes || appointment.durationMinutes || 45;

    // Automatic meeting recording url for admin monitoring
    const recordingUrl =
      appointment.recordingUrl &&
      !appointment.recordingUrl.includes('.internal') &&
      !appointment.recordingUrl.includes('storage.superconsciousness.com') &&
      !appointment.recordingUrl.includes('commondatastorage.googleapis.com')
        ? appointment.recordingUrl
        : '/assets/sample-consultation.mp4';

    const studentInterest = input.studentInterest || 'UNDECIDED';
    const targetStream = input.targetStream?.trim() || null;
    const targetDepartments = input.targetDepartments?.trim() || null;
    const targetColleges = input.targetColleges?.trim() || null;
    const targetCity = input.targetCity?.trim() || null;
    const studyScope = input.studyScope || 'INTERNATIONAL';
    const detailedInterestReport = input.detailedInterestReport?.trim() || null;

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        actualStartTime: startTime,
        actualEndTime: endTime,
        durationMinutes: duration,
        sessionOutcome: input.sessionOutcome.trim(),
        recommendations: input.recommendations?.trim() || null,
        followUpRequired: Boolean(input.followUpRequired),
        nextAction: input.nextAction?.trim() || null,
        followUpActions: input.followUpActions?.trim() || appointment.followUpActions,
        privateCounsellorNotes: input.privateCounsellorNotes?.trim() || null,
        studentInterest,
        targetStream,
        targetDepartments,
        targetColleges,
        targetCity,
        studyScope,
        detailedInterestReport,
        isRecorded: true,
        recordingUrl,
      },
      include: {
        studentProfile: { select: { id: true, fullName: true, contactEmail: true, phone: true } },
        counsellor: { select: { id: true, email: true } },
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: counsellorId,
        action: 'COUNSELLING_SESSION_COMPLETED',
        details: JSON.stringify({
          appointmentId,
          sessionOutcome: input.sessionOutcome,
          studentInterest,
          targetColleges,
          followUpRequired: Boolean(input.followUpRequired),
          durationMinutes: duration,
        }),
      },
    }).catch(() => {});

    // Prepare WhatsApp policy link if student is interested
    let whatsappPolicyLink: string | null = null;
    const phone = updated.studentProfile.phone;
    if (phone && (studentInterest === 'INTERESTED' || input.sendPolicyViaWhatsApp)) {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const collegeTarget = targetColleges || 'your chosen institutions';
      const streamTarget = targetStream || 'higher education program';
      const policyMsg = `Hello ${updated.studentProfile.fullName}! Thank you for attending your Superconsciousness Counselling session. Based on your target interest in ${collegeTarget} (${streamTarget}), here is our official Consultancy Enrollment Agreement and Policy Guide: https://superconsciousness.internal/policies. Please review and confirm your enrollment to proceed with verified university applications without delays.`;
      whatsappPolicyLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(policyMsg)}`;
    }

    return {
      id: updated.id,
      title: updated.title,
      status: updated.status,
      completedAt: updated.completedAt?.toISOString(),
      actualStartTime: updated.actualStartTime?.toISOString(),
      actualEndTime: updated.actualEndTime?.toISOString(),
      durationMinutes: updated.durationMinutes,
      sessionOutcome: updated.sessionOutcome,
      recommendations: updated.recommendations,
      followUpRequired: updated.followUpRequired,
      nextAction: updated.nextAction,
      followUpActions: updated.followUpActions,
      privateCounsellorNotes: updated.privateCounsellorNotes,
      studentName: updated.studentProfile.fullName,
      studentInterest: updated.studentInterest,
      targetStream: updated.targetStream,
      targetDepartments: updated.targetDepartments,
      targetColleges: updated.targetColleges,
      targetCity: updated.targetCity,
      studyScope: updated.studyScope,
      detailedInterestReport: updated.detailedInterestReport,
      isRecorded: updated.isRecorded,
      recordingUrl: updated.recordingUrl,
      whatsappPolicyLink,
    };
  }

  /**
   * Get dynamic available slots for a given counsellor and date
   * Excludes slots where an appointment is already SCHEDULED or CONFIRMED
   */
  public static async getCounsellorAvailableSlots(
    counsellorId: string,
    dateStr: string
  ): Promise<{ date: string; slots: { timeSlot: string; isAvailable: boolean; isBooked: boolean }[] }> {
    const counsellor = await prisma.user.findFirst({
      where: { id: counsellorId, role: Role.COUNSELLOR },
      include: { counsellorProfile: true },
    });

    if (!counsellor) {
      const err: any = new Error('Counsellor not found.');
      err.statusCode = 404;
      throw err;
    }

    // Default base slots or counsellor configured slots
    let baseSlots = DEFAULT_TIME_SLOTS;
    if (counsellor.counsellorProfile?.availableSlots) {
      try {
        const parsed = JSON.parse(counsellor.counsellorProfile.availableSlots);
        if (Array.isArray(parsed) && parsed.length > 0) {
          baseSlots = parsed;
        }
      } catch {}
    }

    // Check custom overrides in CounsellorAvailabilitySlot table
    const customSlots = await prisma.counsellorAvailabilitySlot.findMany({
      where: { counsellorId, date: dateStr },
    });

    // Check active appointments on this date
    // A booking matches if scheduledAt falls on dateStr
    const [year, month, day] = dateStr.split('-').map(Number);
    const dayStart = new Date(year, month - 1, day, 0, 0, 0, 0);
    const dayEnd = new Date(year, month - 1, day, 23, 59, 59, 999);

    const bookedAppointments = await prisma.appointment.findMany({
      where: {
        counsellorId,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        scheduledAt: { gte: dayStart, lte: dayEnd },
      },
    });

    // Build set of booked timeSlot formatted strings
    const bookedSlotStrings = new Set<string>();
    bookedAppointments.forEach((apt) => {
      const hours = apt.scheduledAt.getHours();
      const mins = apt.scheduledAt.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHour = hours % 12 === 0 ? 12 : hours % 12;
      const formattedStr = `${String(formattedHour).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${ampm}`;
      bookedSlotStrings.add(formattedStr);
      // Also add variations like "10:00 AM" or "02:00 PM"
      const shortStr = `${formattedHour}:${String(mins).padStart(2, '0')} ${ampm}`;
      bookedSlotStrings.add(shortStr);
    });

    // Map each base slot to its availability
    const slots = baseSlots.map((slot) => {
      const isCustomBlocked = customSlots.find((cs) => cs.timeSlot === slot && !cs.isAvailable);
      const isCustomBooked = customSlots.find((cs) => cs.timeSlot === slot && cs.isBooked);
      const isBooked =
        bookedSlotStrings.has(slot) ||
        bookedSlotStrings.has(slot.replace(/^0/, '')) ||
        Boolean(isCustomBooked);
      const isAvailable = !isBooked && !isCustomBlocked;

      return {
        timeSlot: slot,
        isAvailable,
        isBooked,
      };
    });

    return {
      date: dateStr,
      slots,
    };
  }

  /**
   * Counsellor: Manage free/open appointment slots
   */
  public static async setCounsellorAvailabilitySlots(
    counsellorId: string,
    dateStr: string,
    timeSlots: string[]
  ) {
    // Delete existing custom slots for this date
    await prisma.counsellorAvailabilitySlot.deleteMany({
      where: { counsellorId, date: dateStr },
    });

    // Create newly specified slots
    await Promise.all(
      timeSlots.map((slot) =>
        prisma.counsellorAvailabilitySlot.create({
          data: {
            counsellorId,
            date: dateStr,
            timeSlot: slot,
            isAvailable: true,
            isBooked: false,
          },
        })
      )
    );

    return {
      success: true,
      message: `Updated availability slots for ${dateStr}.`,
      date: dateStr,
      timeSlots,
    };
  }

  /**
   * Counsellor: Send appointment reminder via WhatsApp or SMS before starting meeting
   */
  public static async sendAppointmentReminder(
    counsellorId: string,
    appointmentId: string,
    method: 'WHATSAPP' | 'SMS' = 'WHATSAPP',
    userRole?: string
  ) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        studentProfile: true,
        counsellor: {
          select: {
            id: true,
            email: true,
            counsellorProfile: { select: { fullName: true } },
          },
        },
      },
    });

    if (!appointment) {
      const err: any = new Error('Appointment not found.');
      err.statusCode = 404;
      throw err;
    }

    if (userRole !== Role.ADMIN && appointment.counsellorId !== counsellorId) {
      const err: any = new Error('Unauthorized to manage this appointment.');
      err.statusCode = 403;
      throw err;
    }

    const phone = appointment.studentProfile?.phone || '+919876543210';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const studentName = appointment.studentProfile?.fullName || 'Student';
    const counsellorName =
      appointment.counsellor?.counsellorProfile?.fullName ||
      appointment.counsellor?.email.split('@')[0] ||
      'Senior Counsellor';

    const dateFormatted = appointment.scheduledAt.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    const timeFormatted = appointment.scheduledAt.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const meetingLink =
      appointment.meetingLocation ||
      `https://meet.superconsciousness.internal/counselling/${appointment.id.slice(0, 8)}`;

    const reminderMessage = `🔔 Reminder: Your Superconsciousness Counselling session with ${counsellorName} is starting at ${timeFormatted} on ${dateFormatted}. Please join on time using this meeting link: ${meetingLink}`;

    // Update appointment with reminder timestamp
    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        reminderSentAt: new Date(),
        reminderSentVia: method,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: counsellorId,
        action: `APPOINTMENT_REMINDER_${method}`,
        details: JSON.stringify({
          appointmentId,
          method,
          phone,
          studentName,
        }),
      },
    }).catch(() => {});

    const whatsappLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(reminderMessage)}`;

    return {
      success: true,
      message: `${method} reminder dispatched successfully to ${studentName}.`,
      reminderSentAt: updated.reminderSentAt?.toISOString(),
      reminderSentVia: updated.reminderSentVia,
      phone,
      whatsappLink,
      smsText: reminderMessage,
    };
  }

  /**
   * Enroll Student with Consultancy and Policy Agreement
   * Awards 1 token/point to the assigned counsellor
   */
  public static async enrollStudent(
    userId: string,
    input: {
      studentProfileId?: string;
      counsellorId?: string;
      targetCollege?: string;
      targetStream?: string;
      agreementSigned?: boolean;
    },
    userRole?: string
  ) {
    let studentProfile: any;

    if (userRole === Role.STUDENT || !input.studentProfileId) {
      studentProfile = await this.getStudentProfile(userId);
    } else {
      studentProfile = await prisma.studentProfile.findUnique({
        where: { id: input.studentProfileId },
        include: { assignedCounsellor: true },
      });
      if (!studentProfile) {
        const err: any = new Error('Student profile not found.');
        err.statusCode = 404;
        throw err;
      }
    }

    const assignedCounsellorId =
      input.counsellorId ||
      studentProfile.assignedCounsellorId ||
      (await prisma.user.findFirst({ where: { role: Role.COUNSELLOR, isActive: true } }))?.id;

    if (!assignedCounsellorId) {
      const err: any = new Error('Cannot enroll without an assigned counsellor.');
      err.statusCode = 400;
      throw err;
    }

    const now = new Date();

    // 1. Update StudentProfile
    await prisma.studentProfile.update({
      where: { id: studentProfile.id },
      data: {
        isEnrolled: true,
        enrolledAt: now,
        policyAgreed: Boolean(input.agreementSigned ?? true),
        policyAgreedAt: now,
        assignedCounsellorId,
      },
    });

    // 2. Upsert StudentEnrollment record
    const enrollment = await prisma.studentEnrollment.upsert({
      where: { studentProfileId: studentProfile.id },
      update: {
        counsellorId: assignedCounsellorId,
        status: 'CONFIRMED',
        agreementSigned: Boolean(input.agreementSigned ?? true),
        targetCollege: input.targetCollege || null,
        targetStream: input.targetStream || null,
        enrolledAt: now,
        pointsAwarded: 1,
      },
      create: {
        studentProfileId: studentProfile.id,
        counsellorId: assignedCounsellorId,
        status: 'CONFIRMED',
        agreementSigned: Boolean(input.agreementSigned ?? true),
        targetCollege: input.targetCollege || null,
        targetStream: input.targetStream || null,
        pointsAwarded: 1,
      },
    });

    // 3. Award 1 token / point to the counsellor
    await prisma.counsellorProfile.upsert({
      where: { userId: assignedCounsellorId },
      update: {
        enrollmentPoints: { increment: 1 },
      },
      create: {
        userId: assignedCounsellorId,
        fullName: 'Counsellor Advisor',
        enrollmentPoints: 1,
      },
    });

    // 4. Audit Log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'STUDENT_ENROLLED_CONSULTANCY',
        details: JSON.stringify({
          studentProfileId: studentProfile.id,
          counsellorId: assignedCounsellorId,
          targetCollege: input.targetCollege || null,
          pointsAwarded: 1,
        }),
      },
    }).catch(() => {});

    return {
      success: true,
      message: 'Consultancy enrollment completed! 1 performance point awarded to counsellor.',
      enrollment: {
        id: enrollment.id,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt.toISOString(),
        pointsAwarded: enrollment.pointsAwarded,
        targetCollege: enrollment.targetCollege,
        targetStream: enrollment.targetStream,
      },
    };
  }

  /**
   * Get Student Enrollment & Policy Status
   */
  public static async getEnrollmentStatus(userId: string) {
    const profile = await this.getStudentProfile(userId);
    const enrollment = await prisma.studentEnrollment.findUnique({
      where: { studentProfileId: profile.id },
      include: {
        counsellor: {
          select: {
            id: true,
            email: true,
            counsellorProfile: { select: { fullName: true } },
          },
        },
      },
    });

    return {
      isEnrolled: profile.isEnrolled,
      enrolledAt: profile.enrolledAt?.toISOString() || null,
      policyAgreed: profile.policyAgreed,
      policyAgreedAt: profile.policyAgreedAt?.toISOString() || null,
      assignedCounsellor: profile.assignedCounsellor,
      enrollment: enrollment
        ? {
            id: enrollment.id,
            status: enrollment.status,
            pointsAwarded: enrollment.pointsAwarded,
            targetCollege: enrollment.targetCollege,
            targetStream: enrollment.targetStream,
            enrolledAt: enrollment.enrolledAt.toISOString(),
            counsellorName:
              enrollment.counsellor.counsellorProfile?.fullName ||
              enrollment.counsellor.email.split('@')[0],
          }
        : null,
    };
  }


  /**
   * 5. List Webinars with Student Registration Status
   */
  public static async listWebinars(userId: string): Promise<WebinarDto[]> {
    await this.ensureSeedData();

    const profile = await this.getStudentProfile(userId);

    const webinars = await prisma.webinar.findMany({
      where: { isPublished: true },
      include: {
        registrations: {
          select: { studentProfileId: true, status: true, registeredAt: true },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    return webinars.map((w) => {
      const studentReg = w.registrations.find(
        (r) => r.studentProfileId === profile.id && r.status === 'REGISTERED'
      );
      const activeCount = w.registrations.filter((r) => r.status === 'REGISTERED').length;

      return {
        id: w.id,
        title: w.title,
        description: w.description,
        speakerName: w.speakerName,
        speakerTitle: w.speakerTitle,
        speakerBio: w.speakerBio,
        topic: w.topic,
        destinationCountry: w.destinationCountry,
        webinarType: (w.webinarType as any) || 'UPCOMING',
        scheduledAt: w.scheduledAt ? w.scheduledAt.toISOString() : null,
        durationMinutes: w.durationMinutes,
        officialLink: w.officialLink,
        recordingUrl: w.recordingUrl,
        bannerUrl: w.bannerUrl,
        isRegistered: Boolean(studentReg),
        registeredCount: activeCount,
        registeredAt: studentReg ? studentReg.registeredAt.toISOString() : null,
      };
    });
  }

  /**
   * 6. Register Student for Webinar
   */
  public static async registerWebinar(
    userId: string,
    webinarId: string
  ): Promise<{ success: boolean; message: string; webinar: WebinarDto }> {
    const profile = await this.getStudentProfile(userId);

    const webinar = await prisma.webinar.findUnique({
      where: { id: webinarId },
    });

    if (!webinar || !webinar.isPublished) {
      const err: any = new Error('Webinar not found or is no longer published.');
      err.statusCode = 404;
      throw err;
    }

    // Upsert registration
    await prisma.webinarRegistration.upsert({
      where: {
        webinarId_studentProfileId: {
          webinarId,
          studentProfileId: profile.id,
        },
      },
      update: {
        status: 'REGISTERED',
        registeredAt: new Date(),
      },
      create: {
        webinarId,
        studentProfileId: profile.id,
        status: 'REGISTERED',
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'WEBINAR_REGISTERED',
        details: JSON.stringify({ webinarId, title: webinar.title }),
      },
    }).catch(() => {});

    const updatedWebinars = await this.listWebinars(userId);
    const updatedWebinar = updatedWebinars.find((w) => w.id === webinarId)!;

    return {
      success: true,
      message: `You have successfully registered for "${webinar.title}". The meeting link is active in your dashboard.`,
      webinar: updatedWebinar,
    };
  }

  /**
   * 7. Cancel Webinar Registration
   */
  public static async cancelWebinarRegistration(
    userId: string,
    webinarId: string
  ): Promise<{ success: boolean; message: string; webinar: WebinarDto }> {
    const profile = await this.getStudentProfile(userId);

    const existing = await prisma.webinarRegistration.findUnique({
      where: {
        webinarId_studentProfileId: {
          webinarId,
          studentProfileId: profile.id,
        },
      },
    });

    if (existing && existing.status === 'REGISTERED') {
      await prisma.webinarRegistration.update({
        where: {
          webinarId_studentProfileId: {
            webinarId,
            studentProfileId: profile.id,
          },
        },
        data: { status: 'CANCELLED' },
      });
    }

    const updatedWebinars = await this.listWebinars(userId);
    const updatedWebinar = updatedWebinars.find((w) => w.id === webinarId)!;

    return {
      success: true,
      message: 'Webinar registration cancelled.',
      webinar: updatedWebinar,
    };
  }

  /**
   * 8. List Shortlisted Colleges (Unified from ShortlistItem & StudentSavedInstitution)
   */
  public static async listShortlistedColleges(userId: string): Promise<ShortlistedCollegeDto[]> {
    const profile = await this.getStudentProfile(userId);

    // 1. Fetch ShortlistItems
    const items = await prisma.shortlistItem.findMany({
      where: {
        studentProfileId: profile.id,
        itemType: 'INSTITUTION',
      },
      orderBy: { createdAt: 'desc' },
    });

    // 2. Fetch StudentSavedInstitutions (Module 6 saved items)
    const savedInstitutions = await prisma.studentSavedInstitution.findMany({
      where: { studentProfileId: profile.id },
      include: {
        institution: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Set of known institution IDs
    const institutionMap = new Map<string, any>();

    // Load from savedInstitutions
    savedInstitutions.forEach((saved) => {
      if (saved.institution) {
        institutionMap.set(saved.institutionId, {
          id: saved.id,
          institutionId: saved.institution.id,
          name: saved.institution.name,
          country: saved.institution.country,
          city: saved.institution.city,
          tier: saved.institution.managedTier || 'Tier 1',
          fitCategory: 'TARGET',
          priority: 'HIGH',
          acceptanceRate: saved.institution.acceptanceRate ? `${saved.institution.acceptanceRate}%` : undefined,
          avgTuitionFee: saved.institution.minAnnualFee
            ? `$${saved.institution.minAnnualFee.toLocaleString()}`
            : undefined,
          notes: saved.notes,
          shortlistedAt: saved.createdAt.toISOString(),
        });
      }
    });

    // Merge or enrich with ShortlistItem records
    const itemIdsToFetch: string[] = [];
    items.forEach((item) => {
      if (institutionMap.has(item.itemId)) {
        const existing = institutionMap.get(item.itemId);
        existing.fitCategory = item.fitCategory || existing.fitCategory;
        existing.priority = item.priority || existing.priority;
        existing.notes = item.notes || existing.notes;
      } else {
        itemIdsToFetch.push(item.itemId);
      }
    });

    if (itemIdsToFetch.length > 0) {
      const institutions = await prisma.institution.findMany({
        where: { id: { in: itemIdsToFetch } },
      });

      institutions.forEach((inst) => {
        const itemRecord = items.find((i) => i.itemId === inst.id);
        institutionMap.set(inst.id, {
          id: itemRecord?.id || inst.id,
          institutionId: inst.id,
          name: inst.name,
          country: inst.country,
          city: inst.city,
          tier: inst.managedTier || 'Tier 1',
          fitCategory: (itemRecord?.fitCategory as any) || 'TARGET',
          priority: (itemRecord?.priority as any) || 'MEDIUM',
          acceptanceRate: inst.acceptanceRate ? `${inst.acceptanceRate}%` : undefined,
          avgTuitionFee: inst.minAnnualFee ? `$${inst.minAnnualFee.toLocaleString()}` : undefined,
          notes: itemRecord?.notes,
          shortlistedAt: itemRecord?.createdAt.toISOString() || new Date().toISOString(),
        });
      });
    }

    return Array.from(institutionMap.values());
  }

  /**
   * 9. Toggle / Save College in Shortlist
   */
  public static async toggleCollegeShortlist(
    userId: string,
    input: {
      institutionId: string;
      fitCategory?: string;
      priority?: string;
      notes?: string;
    }
  ): Promise<{ isShortlisted: boolean; message: string }> {
    const profile = await this.getStudentProfile(userId);

    const institution = await prisma.institution.findUnique({
      where: { id: input.institutionId },
      select: { id: true, name: true },
    });

    if (!institution) {
      const err: any = new Error('College / Institution not found.');
      err.statusCode = 404;
      throw err;
    }

    const existingItem = await prisma.shortlistItem.findUnique({
      where: {
        studentProfileId_itemType_itemId: {
          studentProfileId: profile.id,
          itemType: 'INSTITUTION',
          itemId: input.institutionId,
        },
      },
    });

    if (existingItem) {
      // Remove from shortlist
      await prisma.shortlistItem.delete({
        where: { id: existingItem.id },
      });

      // Also clean from StudentSavedInstitution if exists
      await prisma.studentSavedInstitution.deleteMany({
        where: {
          studentProfileId: profile.id,
          institutionId: input.institutionId,
        },
      });

      return {
        isShortlisted: false,
        message: `Removed "${institution.name}" from your application shortlist.`,
      };
    } else {
      // Add to shortlist
      await prisma.shortlistItem.create({
        data: {
          studentProfileId: profile.id,
          itemType: 'INSTITUTION',
          itemId: input.institutionId,
          fitCategory: input.fitCategory || 'TARGET',
          priority: input.priority || 'MEDIUM',
          notes: input.notes?.trim() || null,
        },
      });

      // Also ensure present in StudentSavedInstitution for backwards module compatibility
      await prisma.studentSavedInstitution.upsert({
        where: {
          studentProfileId_institutionId: {
            studentProfileId: profile.id,
            institutionId: input.institutionId,
          },
        },
        update: { notes: input.notes?.trim() || null },
        create: {
          studentProfileId: profile.id,
          institutionId: input.institutionId,
          notes: input.notes?.trim() || null,
        },
      });

      return {
        isShortlisted: true,
        message: `Saved "${institution.name}" to your application shortlist.`,
      };
    }
  }

  /**
   * Helper to parse date string YYYY-MM-DD and time slot string (e.g. "10:00 AM", "01:30 PM")
   */
  private static parseDateAndSlot(dateStr: string, slotStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    let hours = 9;
    let minutes = 0;

    const trimmed = slotStr.trim().toUpperCase();
    const isPM = trimmed.includes('PM');
    const isAM = trimmed.includes('AM');
    const timeOnly = trimmed.replace('AM', '').replace('PM', '').trim();
    const parts = timeOnly.split(':').map(Number);

    if (parts.length >= 1) {
      hours = parts[0];
      if (isPM && hours < 12) hours += 12;
      if (isAM && hours === 12) hours = 0;
    }
    if (parts.length >= 2) {
      minutes = parts[1];
    }

    const d = new Date(year, month - 1, day, hours, minutes, 0, 0);
    return d;
  }
}

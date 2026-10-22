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
        for (const seed of SEED_WEBINARS) {
          const scheduledAt = new Date();
          scheduledAt.setDate(scheduledAt.getDate() + seed.scheduledDaysFromNow);
          scheduledAt.setHours(seed.scheduledHour, 0, 0, 0);

          await prisma.webinar.create({
            data: {
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
            },
          });
        }
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

    // Fetch active counsellors
    const counsellors = await prisma.user.findMany({
      where: { role: Role.COUNSELLOR, isActive: true },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    const counsellorList = counsellors.map((c) => {
      const isAssigned = profile.assignedCounsellorId === c.id;
      return {
        id: c.id,
        email: c.email,
        fullName: isAssigned ? 'Assigned Lead Counsellor' : `Academic Advisor (${c.email.split('@')[0]})`,
        role: 'Certified Educational Counsellor',
        specialization: 'Undergraduate Admissions & STEM Career Pathways',
        bio: 'Expert consultant specializing in college evaluation, profile spikes, and university admissions.',
        isAssigned,
      };
    });

    // Also get student's shortlisted colleges to populate the context selector
    const shortlist = await this.listShortlistedColleges(userId);

    return {
      studentInfo: {
        fullName: profile.fullName,
        email: profile.contactEmail,
        grade: profile.grade,
        assignedCounsellorId: profile.assignedCounsellorId,
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
      counsellorId: apt.counsellorId,
      counsellorName: `Counsellor (${apt.counsellor.email.split('@')[0]})`,
      counsellorEmail: apt.counsellor.email,
      attachments: apt.attachments,
      followUpActions: apt.followUpActions,
      cancellationReason: apt.cancellationReason,
      cancelledAt: apt.cancelledAt?.toISOString() || null,
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

    // Validate counsellor exists and has counsellor role
    const counsellor = await prisma.user.findFirst({
      where: { id: input.counsellorId, role: Role.COUNSELLOR, isActive: true },
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

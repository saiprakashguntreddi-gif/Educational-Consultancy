import { Router } from 'express';
import { AppointmentsController } from './appointments.controller';
import { authenticateJwt } from '../../shared/middleware/auth.middleware';
import { validateRequest } from '../../shared/middleware/validation.middleware';
import {
  bookAppointmentSchema,
  cancelAppointmentSchema,
  toggleShortlistSchema,
  updateAppointmentStatusSchema,
  recordSessionOutcomeSchema,
  sendReminderSchema,
  manageCounsellorSlotsSchema,
  enrollStudentSchema,
} from './appointments.validation';

export const appointmentsRouter = Router();

// ==========================================
// 1. APPOINTMENTS & COUNSELLOR BOOKING
// ==========================================

// Metadata: Counsellor list, appointment types, time slots, shortlisted college contexts
appointmentsRouter.get('/meta', authenticateJwt, AppointmentsController.getMeta);

// Student's personal appointments list
appointmentsRouter.get(
  '/my-appointments',
  authenticateJwt,
  AppointmentsController.getMyAppointments
);

// Book a new counselling session
appointmentsRouter.post(
  '/book',
  authenticateJwt,
  validateRequest(bookAppointmentSchema),
  AppointmentsController.bookAppointment
);
appointmentsRouter.post(
  '/',
  authenticateJwt,
  validateRequest(bookAppointmentSchema),
  AppointmentsController.bookAppointment
);

// Cancel an upcoming appointment
appointmentsRouter.patch(
  '/:id/cancel',
  authenticateJwt,
  validateRequest(cancelAppointmentSchema),
  AppointmentsController.cancelAppointment
);

// Counsellor Schedule: All appointments for the logged-in counsellor
appointmentsRouter.get(
  '/counsellor/schedule',
  authenticateJwt,
  AppointmentsController.getCounsellorSchedule
);

// Counsellor: Accept, Reschedule, or Cancel an appointment
appointmentsRouter.patch(
  '/:id/counsellor-status',
  authenticateJwt,
  validateRequest(updateAppointmentStatusSchema),
  AppointmentsController.updateAppointmentStatusByCounsellor
);
appointmentsRouter.patch(
  '/counsellor/:id/status',
  authenticateJwt,
  validateRequest(updateAppointmentStatusSchema),
  AppointmentsController.updateAppointmentStatusByCounsellor
);

// Counsellor: Complete session and record outcome, recommendations, notes
appointmentsRouter.post(
  '/:id/session-outcome',
  authenticateJwt,
  validateRequest(recordSessionOutcomeSchema),
  AppointmentsController.recordSessionOutcome
);
appointmentsRouter.post(
  '/counsellor/:id/record-outcome',
  authenticateJwt,
  validateRequest(recordSessionOutcomeSchema),
  AppointmentsController.recordSessionOutcome
);

// Counsellor & Student: Dynamic Available Slots for Counsellor on a Date
appointmentsRouter.get(
  '/counsellor/:counsellorId/available-slots',
  authenticateJwt,
  AppointmentsController.getCounsellorAvailableSlots
);

// Counsellor: Update Available Slots / Timings
appointmentsRouter.post(
  '/counsellor/slots',
  authenticateJwt,
  validateRequest(manageCounsellorSlotsSchema),
  AppointmentsController.setCounsellorAvailabilitySlots
);

// Counsellor: Send Pre-Meeting Reminder via WhatsApp or SMS
appointmentsRouter.post(
  '/:id/send-reminder',
  authenticateJwt,
  validateRequest(sendReminderSchema),
  AppointmentsController.sendAppointmentReminder
);

// Student / Counsellor: Enroll with Consultancy and Policy Agreement
appointmentsRouter.post(
  '/enroll',
  authenticateJwt,
  validateRequest(enrollStudentSchema),
  AppointmentsController.enrollStudent
);

// Student: Check Current Consultancy Enrollment and Policy Status
appointmentsRouter.get(
  '/enrollment-status',
  authenticateJwt,
  AppointmentsController.getEnrollmentStatus
);


// ==========================================
// 2. WEBINARS & ADMISSIONS MASTERCLASSES
// ==========================================

// List upcoming and recorded webinars
appointmentsRouter.get(
  '/webinars',
  authenticateJwt,
  AppointmentsController.listWebinars
);

// Register for a webinar
appointmentsRouter.post(
  '/webinars/:id/register',
  authenticateJwt,
  AppointmentsController.registerWebinar
);

// Cancel webinar registration
appointmentsRouter.post(
  '/webinars/:id/cancel-registration',
  authenticateJwt,
  AppointmentsController.cancelWebinarRegistration
);

// ==========================================
// 3. SHORTLISTS INTEGRATION
// ==========================================

// List student's shortlisted colleges with Tier/Fit details
appointmentsRouter.get(
  '/shortlists',
  authenticateJwt,
  AppointmentsController.listShortlists
);

// Toggle college shortlist status
appointmentsRouter.post(
  '/shortlists/toggle',
  authenticateJwt,
  validateRequest(toggleShortlistSchema),
  AppointmentsController.toggleShortlist
);

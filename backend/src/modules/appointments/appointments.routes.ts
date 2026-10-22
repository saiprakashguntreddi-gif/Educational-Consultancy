import { Router } from 'express';
import { AppointmentsController } from './appointments.controller';
import { authenticateJwt } from '../../shared/middleware/auth.middleware';
import { validateRequest } from '../../shared/middleware/validation.middleware';
import {
  bookAppointmentSchema,
  cancelAppointmentSchema,
  toggleShortlistSchema,
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

// Cancel an upcoming appointment
appointmentsRouter.patch(
  '/:id/cancel',
  authenticateJwt,
  validateRequest(cancelAppointmentSchema),
  AppointmentsController.cancelAppointment
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

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { AppointmentsService } from '../services/appointments.service';
import {
  AppointmentDto,
  AppointmentType,
  AppointmentsMetaResponse,
  BookAppointmentInput,
  MeetingMode,
  ShortlistedCollegeDto,
  WebinarDto,
} from '../appointments.types';
import '../appointments.css';
import { InteractiveMeetingModal } from '../../counsellor/components/InteractiveMeetingModal';
import { SessionAuditDetailsModal } from '../../counsellor/components/SessionAuditDetailsModal';

// Feather / Lucide icons (available in project dependencies)
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  User,
  CheckCircle,
  AlertCircle,
  X,
  Bookmark,
  CalendarCheck,
  CalendarPlus,
  ArrowRight,
  Info,
  ExternalLink,
  ChevronRight,
  Users,
  Compass,
  GraduationCap,
  BookOpen,
  Award,
  Lock,
  ShieldAlert,
} from 'lucide-react';

interface AppointmentsDashboardProps {
  initialTab?: 'book' | 'my-appointments' | 'webinars' | 'shortlist';
  preselectedCollegeId?: string;
  onNavigateTab?: (tab: string) => void;
  isShortlistOnly?: boolean;
  verificationStatus?: string;
  onNavigateToEducation?: () => void;
  onEnrolled?: () => void;
}

export const AppointmentsDashboard: React.FC<AppointmentsDashboardProps> = ({
  initialTab = 'book',
  preselectedCollegeId,
  onNavigateTab,
  isShortlistOnly = false,
  verificationStatus,
  onNavigateToEducation,
  onEnrolled,
}) => {
  const { user } = useAuth();

  // Active sub-navigation tab
  const [activeTab, setActiveTab] = useState<'book' | 'my-appointments' | 'webinars' | 'shortlist'>(
    initialTab
  );

  // Data states
  const [meta, setMeta] = useState<AppointmentsMetaResponse | null>(null);
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [webinars, setWebinars] = useState<WebinarDto[]>([]);
  const [shortlists, setShortlists] = useState<ShortlistedCollegeDto[]>([]);

  // Loading & Feedback states
  const [loading, setLoading] = useState<boolean>(true);
  const [submittingBooking, setSubmittingBooking] = useState<boolean>(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Modals
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDto | null>(null);
  const [cancellingAppointment, setCancellingAppointment] = useState<AppointmentDto | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [activeMeetingAppointment, setActiveMeetingAppointment] = useState<AppointmentDto | null>(null);
  const [viewSessionRecord, setViewSessionRecord] = useState<AppointmentDto | null>(null);

  // Filters for My Appointments & Webinars & Shortlists
  const [appointmentFilter, setAppointmentFilter] = useState<'ALL' | 'UPCOMING' | 'PAST' | 'CANCELLED'>('ALL');
  const [webinarFilter, setWebinarFilter] = useState<'ALL' | 'UPCOMING' | 'RECORDED' | 'REGISTERED'>('ALL');
  const [shortlistFilter, setShortlistFilter] = useState<'ALL' | 'DREAM' | 'REACH' | 'TARGET' | 'SAFE'>('ALL');

  // Booking Form State
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const [bookingType, setBookingType] = useState<AppointmentType>('CAREER_COUNSELLING');
  const [selectedCounsellorId, setSelectedCounsellorId] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState<string>(tomorrowStr);
  const [timeSlot, setTimeSlot] = useState<string>('10:00 AM');
  const [meetingMode, setMeetingMode] = useState<MeetingMode>('ONLINE_COUNSELLING');
  const [relatedCollegeId, setRelatedCollegeId] = useState<string>(preselectedCollegeId || '');
  const [studentNotes, setStudentNotes] = useState<string>('');

  // Dynamic slot availability (PDF Requirement: slots limited to counsellor free timings)
  const [availableSlots, setAvailableSlots] = useState<{ timeSlot: string; isAvailable: boolean; isBooked: boolean }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);

  // Consultancy Enrollment & Policy Agreement State (PDF Requirement)
  const [enrollmentStatus, setEnrollmentStatus] = useState<{
    isEnrolled: boolean;
    enrolledAt: string | null;
    policyAgreed: boolean;
    policyAgreedAt: string | null;
    assignedCounsellor: any;
    enrollment: any;
  } | null>(null);
  const [enrollmentModalOpen, setEnrollmentModalOpen] = useState<boolean>(false);
  const [submittingEnrollment, setSubmittingEnrollment] = useState<boolean>(false);
  const [agreedToPolicies, setAgreedToPolicies] = useState<boolean>(true);

  // Fetch dynamic available slots for assigned counsellor on date
  const fetchDynamicSlots = async (counsellorId: string, date: string) => {
    if (!counsellorId || !date) return;
    setLoadingSlots(true);
    try {
      const res = await AppointmentsService.getCounsellorAvailableSlots(counsellorId, date);
      if (res.success && res.data) {
        setAvailableSlots(res.data.slots);
        const firstFree = res.data.slots.find((s) => s.isAvailable && !s.isBooked);
        if (firstFree) {
          setTimeSlot(firstFree.timeSlot);
        }
      }
    } catch (err) {
      console.error('Failed to fetch counsellor available slots:', err);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Handle Official Consultancy Enrollment
  const handleConfirmEnrollment = async () => {
    if (!agreedToPolicies) {
      alert('Please agree to company policies and agreements to proceed with enrollment.');
      return;
    }
    setSubmittingEnrollment(true);
    try {
      const res = await AppointmentsService.enrollStudent({
        counsellorId: selectedCounsellorId || meta?.assignedCounsellor?.id,
        agreementSigned: true,
      });
      if (res.success) {
        setFeedback({
          type: 'success',
          message: 'Congratulations! You are now officially enrolled with Superconsciousness Educational Consultancy! 1 performance token awarded to your counsellor.',
        });
        setEnrollmentModalOpen(false);
        // Reload status
        const statusRes = await AppointmentsService.getEnrollmentStatus().catch(() => null);
        if (statusRes?.success && statusRes.data) {
          setEnrollmentStatus(statusRes.data);
        }
        if (onEnrolled) {
          onEnrolled();
        }
      } else {
        alert(res.message || 'Enrollment could not be processed.');
      }
    } catch (err: any) {
      alert(`Enrollment failed: ${err.message}`);
    } finally {
      setSubmittingEnrollment(false);
    }
  };

  // Load all data on mount
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [metaRes, appRes, webRes, shortRes, enrollRes] = await Promise.all([
        AppointmentsService.getMeta(),
        AppointmentsService.getMyAppointments(),
        AppointmentsService.listWebinars(),
        AppointmentsService.listShortlistedColleges(),
        AppointmentsService.getEnrollmentStatus().catch(() => null),
      ]);

      if (metaRes.success && metaRes.data) {
        setMeta(metaRes.data);
        const resolvedCounsellorId =
          metaRes.data.assignedCounsellor?.id ||
          (metaRes.data.counsellors && metaRes.data.counsellors.length > 0 ? metaRes.data.counsellors[0].id : '');
        setSelectedCounsellorId(resolvedCounsellorId);

        if (resolvedCounsellorId) {
          fetchDynamicSlots(resolvedCounsellorId, scheduledDate);
        }
      }

      if (appRes.success && appRes.data) {
        setAppointments(appRes.data);
      }

      if (webRes.success && webRes.data) {
        setWebinars(webRes.data);
      }

      if (shortRes.success && shortRes.data) {
        setShortlists(shortRes.data);
      }

      if (enrollRes?.success && enrollRes.data) {
        setEnrollmentStatus(enrollRes.data);
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to initialize appointments and masterclasses data.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Update initial tab or preselected college when props change
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
    if (preselectedCollegeId) {
      setRelatedCollegeId(preselectedCollegeId);
      setActiveTab('book');
    }
  }, [initialTab, preselectedCollegeId]);

  // Dynamic slot availability on date or counsellor selection change (PDF Requirement)
  useEffect(() => {
    if (selectedCounsellorId && scheduledDate) {
      fetchDynamicSlots(selectedCounsellorId, scheduledDate);
    }
  }, [selectedCounsellorId, scheduledDate]);

  // Appointment Type Metadata helper
  const appointmentTypesList = useMemo(() => {
    return [
      {
        type: 'CAREER_COUNSELLING' as AppointmentType,
        label: 'Career Counselling',
        desc: 'In-depth profile diagnosis, aptitude mapping, and long-term career trajectory design.',
        icon: <Compass size={18} />,
        duration: '45 mins',
      },
      {
        type: 'COLLEGE_ADMISSION' as AppointmentType,
        label: 'College Admission Guidance',
        desc: 'Target university shortlisting, SOP/essay reviews, and application strategy review.',
        icon: <GraduationCap size={18} />,
        duration: '45 mins',
      },
      {
        type: 'COURSE_SELECTION' as AppointmentType,
        label: 'Course Selection',
        desc: 'Curriculum comparison, credit evaluations, and international program specialization choice.',
        icon: <BookOpen size={18} />,
        duration: '30 mins',
      },
      {
        type: 'SCHOLARSHIP_GUIDANCE' as AppointmentType,
        label: 'Scholarship Guidance',
        desc: 'Need-based and merit-based grant identification, waiver applications, and financial strategy.',
        icon: <Award size={18} />,
        duration: '30 mins',
      },
      {
        type: 'GENERAL_CONSULTATION' as AppointmentType,
        label: 'General Consultation',
        desc: 'Open Q&A with certified educational advisors on study-abroad timelines and visa guidelines.',
        icon: <Users size={18} />,
        duration: '30 mins',
      },
    ];
  }, []);

  // Selected counsellor object
  const currentCounsellor = useMemo(() => {
    if (!meta || !selectedCounsellorId) return null;
    return meta.counsellors.find((c) => c.id === selectedCounsellorId) || meta.counsellors[0] || null;
  }, [meta, selectedCounsellorId]);

  // Selected college object (if chosen as context)
  const selectedCollegeObj = useMemo(() => {
    if (!relatedCollegeId || !shortlists) return null;
    return shortlists.find((col) => col.institutionId === relatedCollegeId || col.id === relatedCollegeId);
  }, [relatedCollegeId, shortlists]);

  // Handle Book Appointment
  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // Student Verification Check
    if (user?.role === 'STUDENT' && verificationStatus && verificationStatus !== 'VERIFIED') {
      setFeedback({
        type: 'error',
        message: 'Appointment booking is locked until your student profile and educational certificates are verified by an administrator.',
      });
      return;
    }

    // 1. Validation: date must not be in past
    const selectedDateObj = new Date(scheduledDate + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDateObj < today) {
      setFeedback({
        type: 'error',
        message: 'Appointment date cannot be in the past. Please choose a future date.',
      });
      return;
    }

    if (!selectedCounsellorId) {
      setFeedback({
        type: 'error',
        message: 'Please choose an available counsellor for your consultation session.',
      });
      return;
    }

    if (!timeSlot) {
      setFeedback({
        type: 'error',
        message: 'Please select an available time slot for your appointment.',
      });
      return;
    }

    // 2. Duplicate check on client side
    const slotCollision = appointments.some((a) => {
      if (a.status === 'CANCELLED') return false;
      const appDateStr = a.scheduledAt.split('T')[0];
      return appDateStr === scheduledDate && a.title.includes(timeSlot);
    });

    if (slotCollision) {
      setFeedback({
        type: 'error',
        message: `You already have an active appointment scheduled for ${scheduledDate} at ${timeSlot}. Please choose a different slot.`,
      });
      return;
    }

    setSubmittingBooking(true);
    try {
      const payload: BookAppointmentInput = {
        appointmentType: bookingType,
        counsellorId: selectedCounsellorId,
        scheduledDate,
        timeSlot,
        meetingType: meetingMode,
        relatedCollegeId: selectedCollegeObj ? selectedCollegeObj.institutionId : undefined,
        relatedCollegeName: selectedCollegeObj ? selectedCollegeObj.name : undefined,
        studentNotes: studentNotes.trim() ? studentNotes.trim() : undefined,
      };

      const res = await AppointmentsService.bookAppointment(payload);
      if (res.success && res.data) {
        const newApp = res.data;
        setAppointments((prev) => [newApp, ...prev]);
        setFeedback({
          type: 'success',
          message: `Appointment successfully scheduled with ${newApp.counsellorName} for ${scheduledDate} at ${timeSlot}! Confirmation email and calendar invite dispatched.`,
        });
        // Reset message
        setStudentNotes('');
        // Switch to "My Appointments" tab to view it
        setActiveTab('my-appointments');
      } else {
        setFeedback({
          type: 'error',
          message: res.message || 'Unable to book appointment at this time.',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Slot collision or booking error. Please select another time slot.',
      });
    } finally {
      setSubmittingBooking(false);
    }
  };

  // Handle Cancel Appointment
  const handleConfirmCancelAppointment = async () => {
    if (!cancellingAppointment) return;
    setActionLoadingId(cancellingAppointment.id);
    setFeedback(null);
    try {
      const res = await AppointmentsService.cancelAppointment(
        cancellingAppointment.id,
        cancelReason.trim() || 'Cancelled by student'
      );
      if (res.success && res.data) {
        const cancelledApp = res.data;
        setAppointments((prev) =>
          prev.map((a) => (a.id === cancellingAppointment.id ? cancelledApp : a))
        );
        setFeedback({
          type: 'success',
          message: `Appointment #${cancellingAppointment.id.slice(-6)} has been cancelled.`,
        });
        setCancellingAppointment(null);
        setCancelReason('');
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to cancel appointment. Please contact support.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Webinar Registration
  const handleRegisterWebinar = async (webinar: WebinarDto) => {
    setActionLoadingId(webinar.id);
    setFeedback(null);
    try {
      const res = await AppointmentsService.registerWebinar(webinar.id);
      if (res.success && res.data) {
        const updatedWebinar = res.data.webinar;
        setWebinars((prev) =>
          prev.map((w) => (w.id === webinar.id ? updatedWebinar : w))
        );
        setFeedback({
          type: 'success',
          message: `Successfully registered for "${webinar.title}"! Join details and calendar reminder dispatched to your registered email.`,
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Could not complete webinar registration.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Cancel Webinar Registration
  const handleCancelWebinarRegistration = async (webinar: WebinarDto) => {
    setActionLoadingId(webinar.id);
    setFeedback(null);
    try {
      const res = await AppointmentsService.cancelWebinarRegistration(webinar.id);
      if (res.success && res.data) {
        const cancelledWebinar = res.data.webinar;
        setWebinars((prev) =>
          prev.map((w) => (w.id === webinar.id ? cancelledWebinar : w))
        );
        setFeedback({
          type: 'success',
          message: `Registration for "${webinar.title}" has been removed.`,
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Could not cancel webinar registration.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    const now = new Date();
    return appointments.filter((app) => {
      if (appointmentFilter === 'ALL') return true;
      if (appointmentFilter === 'CANCELLED') return app.status === 'CANCELLED';
      if (appointmentFilter === 'UPCOMING') {
        return (
          app.status !== 'CANCELLED' &&
          new Date(app.scheduledAt) >= new Date(now.getTime() - 2 * 60 * 60 * 1000)
        );
      }
      if (appointmentFilter === 'PAST') {
        return (
          app.status === 'COMPLETED' ||
          (app.status !== 'CANCELLED' &&
            new Date(app.scheduledAt) < new Date(now.getTime() - 2 * 60 * 60 * 1000))
        );
      }
      return true;
    });
  }, [appointments, appointmentFilter]);

  // Filtered Webinars
  const filteredWebinars = useMemo(() => {
    return webinars.filter((w) => {
      if (webinarFilter === 'ALL') return true;
      if (webinarFilter === 'REGISTERED') return w.isRegistered;
      if (webinarFilter === 'UPCOMING') return w.webinarType === 'UPCOMING';
      if (webinarFilter === 'RECORDED') return w.webinarType === 'RECORDED';
      return true;
    });
  }, [webinars, webinarFilter]);

  // Filtered Shortlists
  const filteredShortlists = useMemo(() => {
    return shortlists.filter((col) => {
      if (shortlistFilter === 'ALL') return true;
      return col.fitCategory === shortlistFilter;
    });
  }, [shortlists, shortlistFilter]);

  // Shortlist metrics
  const shortlistMetrics = useMemo(() => {
    return {
      total: shortlists.length,
      dream: shortlists.filter((s) => s.fitCategory === 'DREAM').length,
      reach: shortlists.filter((s) => s.fitCategory === 'REACH').length,
      target: shortlists.filter((s) => s.fitCategory === 'TARGET').length,
      safe: shortlists.filter((s) => s.fitCategory === 'SAFE').length,
    };
  }, [shortlists]);

  // Handle pre-fill appointment from a shortlisted college
  const handleBookForCollege = (college: ShortlistedCollegeDto) => {
    setRelatedCollegeId(college.institutionId);
    setBookingType('COLLEGE_ADMISSION');
    setStudentNotes(`Consultation regarding admission criteria, scholarships, and portfolio for ${college.name}.`);
    if (isShortlistOnly && onNavigateTab) {
      onNavigateTab('appointments');
    } else {
      setActiveTab('book');
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const registeredWebinarCount = webinars.filter((w) => w.isRegistered).length;
  const upcomingAppointmentCount = appointments.filter(
    (a) => a.status === 'SCHEDULED' || a.status === 'CONFIRMED'
  ).length;

  if (loading) {
    return (
      <div className="app-container" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
        <div style={{ color: '#5B4FE9', fontWeight: 750, fontSize: '1.15rem' }}>
          Loading consultations, webinars, and university shortlists...
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* 1. TOP HERO HEADER */}
      <div className="app-header-card">
        <h1 className="app-hero-title">
          {isShortlistOnly ? 'University Shortlist' : 'Appointments & Webinars'}
        </h1>
        <p className="app-hero-subtitle">
          {isShortlistOnly
            ? 'Manage your shortlisted universities, compare institutions, organize Dream, Reach, Target, and Safe choices, and review your saved college details in one place.'
            : 'Book certified 1-on-1 career counselling sessions, join live admissions webinars with university delegates, and anchor your consultations with your shortlisted institutions.'}
        </p>
      </div>

      {/* 2. SUB-NAVIGATION TABS */}
      <div className="app-tabs-nav">
        {!isShortlistOnly ? (
          <>
            <button
              className={`app-tab-btn ${activeTab === 'book' ? 'active' : ''}`}
              onClick={() => setActiveTab('book')}
            >
              <CalendarPlus size={16} />
              <span>Book Appointment</span>
            </button>

            <button
              className={`app-tab-btn ${activeTab === 'my-appointments' ? 'active' : ''}`}
              onClick={() => setActiveTab('my-appointments')}
            >
              <CalendarCheck size={16} />
              <span>My Appointments</span>
              {upcomingAppointmentCount > 0 && (
                <span className="app-tab-count">{upcomingAppointmentCount}</span>
              )}
            </button>

            <button
              className={`app-tab-btn ${activeTab === 'webinars' ? 'active' : ''}`}
              onClick={() => setActiveTab('webinars')}
            >
              <Video size={16} />
              <span>Webinars & Masterclasses</span>
              {registeredWebinarCount > 0 && (
                <span className="app-tab-count">{registeredWebinarCount}</span>
              )}
            </button>
          </>
        ) : (
          <button
            className={`app-tab-btn ${activeTab === 'shortlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('shortlist')}
          >
            <Bookmark size={16} />
            <span>University Shortlist</span>
            {shortlists.length > 0 && (
              <span className="app-tab-count">{shortlists.length}</span>
            )}
          </button>
        )}
      </div>

      {/* 3. FEEDBACK ALERT */}
      {feedback && (
        <div className={`app-alert app-alert-${feedback.type}`}>
          <div className="app-alert-icon">
            {feedback.type === 'success' ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
          </div>
          <div className="app-alert-content">{feedback.message}</div>
          <button
            className="app-alert-close"
            onClick={() => setFeedback(null)}
            aria-label="Close notification"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ====================================================================
          TAB 1: BOOK APPOINTMENT
         ==================================================================== */}
      {activeTab === 'book' && (
        <div className="app-booking-layout">
          {/* LEFT: BOOKING FORM */}
          <div className="app-card">
            {/* Student Verification Gate Banner */}
            {user?.role === 'STUDENT' && verificationStatus && verificationStatus !== 'VERIFIED' && (
              <div
                style={{
                  padding: '1.25rem 1.35rem',
                  backgroundColor: '#fffbeb',
                  border: '1.5px solid #f59e0b',
                  borderRadius: '10px',
                  marginBottom: '1.25rem',
                  boxShadow: '0 2px 6px rgba(245, 158, 11, 0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <ShieldAlert size={22} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#92400e' }}>
                        Appointment Booking Locked &mdash; Admin Verification Required
                      </h4>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          backgroundColor: '#fef3c7',
                          color: '#b45309',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '10px',
                          border: '1px solid #fcd34d',
                        }}
                      >
                        STATUS: {verificationStatus}
                      </span>
                    </div>
                    <p style={{ margin: '0.35rem 0 0.75rem', fontSize: '0.82rem', color: '#78350f', lineHeight: 1.45 }}>
                      As per official admission protocol, your educational certificates (10th, 12th, and Graduate certificates based on your target study category) must be authenticated by an Admissions Administrator before you can schedule a counseling consultation.
                    </p>
                    {onNavigateToEducation && (
                      <button
                        type="button"
                        onClick={onNavigateToEducation}
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: '#ffffff',
                          backgroundColor: '#d97706',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.4rem 0.8rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <span>View / Upload Education Documents</span>
                        <ArrowRight size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Consultancy Enrollment & Policy Agreement Banner (PDF Requirement) */}
            {enrollmentStatus?.isEnrolled ? (
              <div
                style={{
                  padding: '1rem 1.25rem',
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  borderRadius: '10px',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Award size={24} color="#059669" />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#065F46' }}>
                      Official Consultancy Enrolled Student
                    </h4>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#047857' }}>
                      Agreement & Policies confirmed. Priority application processing & dedicated counsellor token awarded.
                    </p>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#065F46',
                    backgroundColor: '#D1FAE5',
                    padding: '0.25rem 0.65rem',
                    borderRadius: 9999,
                    border: '1px solid #6EE7B7',
                    whiteSpace: 'nowrap',
                  }}
                >
                  ✓ Enrolled
                </span>
              </div>
            ) : (
              <div
                style={{
                  padding: '1rem 1.25rem',
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  borderRadius: '10px',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <GraduationCap size={24} color="#2563EB" />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#1E40AF' }}>
                      Consultancy Enrollment & Policy Agreement
                    </h4>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#3B82F6' }}>
                      Agree to company policies and enroll with our consultancy to guarantee college admission guidance.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEnrollmentModalOpen(true)}
                  style={{
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.45rem 0.95rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
                  }}
                >
                  Enroll with Consultancy
                </button>
              </div>
            )}

            <h2 className="app-card-title">
              <Calendar size={20} color="#5B4FE9" />
              <span>Schedule Counselling Session</span>
            </h2>
            <p className="app-card-desc">
              Choose your consultation focus, select your preferred counsellor, and reserve an open time slot.
            </p>

            <form onSubmit={handleBookAppointment}>
              {/* 1. Logged-in Student Identity (Readonly Strip) */}
              <div className="app-student-strip">
                <div className="app-student-strip-info">
                  <div className="app-avatar-circle">
                    {(user?.email || 'S').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="app-student-name">
                      {user?.role === 'STUDENT' ? 'Registered Student Account' : 'Authenticated User'}
                    </div>
                    <div className="app-student-email">{user?.email}</div>
                  </div>
                </div>
                <div className="app-verified-pill">
                  <CheckCircle size={13} />
                  <span>Verified Profile</span>
                </div>
              </div>

              {/* 2. Appointment Type Selection */}
              <div className="app-form-section">
                <div className="app-form-section-label">
                  <span>1. Select Appointment Type</span>
                </div>
                <div className="app-type-grid">
                  {appointmentTypesList.map((item) => (
                    <div
                      key={item.type}
                      className={`app-type-card ${
                        bookingType === item.type ? 'selected' : ''
                      }`}
                      onClick={() => setBookingType(item.type)}
                    >
                      <div className="app-type-header">
                        <div className="app-type-icon">{item.icon}</div>
                        <span className="app-type-duration">{item.duration}</span>
                      </div>
                      <h4 className="app-type-title">{item.label}</h4>
                      <p className="app-type-desc">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Counsellor Selection (Enforcing Admin-controlled Assignment) */}
              <div className="app-form-section">
                <div className="app-form-section-label">
                  <span>2. Your Dedicated Senior Counsellor</span>
                </div>
                {meta?.assignedCounsellor ? (
                  <div
                    style={{
                      padding: '1.25rem 1.4rem',
                      backgroundColor: '#F8FAFC',
                      border: '2px solid #2563EB',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.25rem',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.08)',
                    }}
                  >
                    <div
                      style={{
                        width: 58,
                        height: 58,
                        borderRadius: '50%',
                        backgroundColor: '#EFF6FF',
                        border: '2px solid #BFDBFE',
                        color: '#2563EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.4rem',
                        fontWeight: 700,
                      }}
                    >
                      {meta.assignedCounsellor.fullName?.charAt(0) || meta.assignedCounsellor.email?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
                          {meta.assignedCounsellor.fullName || meta.assignedCounsellor.email.split('@')[0]}
                        </h4>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16A34A', backgroundColor: '#F0FDF4', padding: '0.15rem 0.55rem', borderRadius: 9999, border: '1px solid #BBF7D0' }}>
                          ● Official Assigned Counsellor
                        </span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#2563EB', fontWeight: 600, marginTop: 2 }}>
                        {meta.assignedCounsellor.specialization || 'Academic & Admissions Guidance'} • {meta.assignedCounsellor.experienceYears || 5} years experience
                      </div>
                      <p style={{ margin: '0.35rem 0', fontSize: '0.8rem', color: '#64748B', lineHeight: 1.4 }}>
                        {meta.assignedCounsellor.bio || 'Official institutional counsellor assigned to guide your admissions journey.'}
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.4rem' }}>
                        {(meta.assignedCounsellor.skills || ['Career Guidance', 'University Selection']).map((skill: string, sIdx: number) => (
                          <span key={sIdx} style={{ fontSize: '0.72rem', backgroundColor: '#F1F5F9', color: '#334155', padding: '0.15rem 0.45rem', borderRadius: 4 }}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '1.25rem 1.5rem',
                      backgroundColor: '#FFFBEB',
                      border: '1px solid #FDE68A',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                    }}
                  >
                    <AlertCircle size={32} color="#D97706" />
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#92400E' }}>
                        Counsellor Assignment in Progress
                      </h4>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: '#B45309', lineHeight: 1.4 }}>
                        Your student account is currently in the unassigned pool. An administrator will review your academic intake and allocate your dedicated senior counsellor shortly. Consultation booking will activate immediately upon assignment.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Date & Time Slot Selection */}
              <div className="app-form-section">
                <div className="app-form-section-label">
                  <span>3. Choose Date & Time Slot</span>
                </div>
                <div className="app-datetime-row">
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: '#475569',
                        marginBottom: '0.4rem',
                      }}
                    >
                      Appointment Date (Future dates only)
                    </label>
                    <input
                      type="date"
                      className="app-input-field"
                      min={tomorrowStr}
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      required
                    />
                    <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '0.35rem' }}>
                      Selected: <strong>{new Date(scheduledDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: '#475569',
                        marginBottom: '0.4rem',
                      }}
                    >
                      Available Time Slot (IST)
                    </label>
                    <div className="app-slot-grid">
                      {loadingSlots ? (
                        <div style={{ gridColumn: '1 / -1', padding: '0.75rem', color: '#64748B', fontSize: '0.82rem' }}>
                          Checking counsellor's live schedule for {scheduledDate}...
                        </div>
                      ) : availableSlots.length > 0 ? (
                        availableSlots.map((slot) => {
                          const isUnavailable = !slot.isAvailable || slot.isBooked;
                          return (
                            <button
                              key={slot.timeSlot}
                              type="button"
                              disabled={isUnavailable}
                              className={`app-slot-btn ${
                                timeSlot === slot.timeSlot && !isUnavailable ? 'selected' : ''
                              }`}
                              style={
                                isUnavailable
                                  ? {
                                      opacity: 0.5,
                                      cursor: 'not-allowed',
                                      backgroundColor: '#F1F5F9',
                                      color: '#94A3B8',
                                      border: '1px dashed #CBD5E1',
                                      position: 'relative',
                                    }
                                  : undefined
                              }
                              onClick={() => setTimeSlot(slot.timeSlot)}
                              title={isUnavailable ? 'Counsellor is unavailable / already booked at this time' : 'Available'}
                            >
                              <span>{slot.timeSlot}</span>
                              {slot.isBooked && (
                                <span style={{ fontSize: '0.65rem', color: '#DC2626', fontWeight: 700, marginLeft: '0.35rem' }}>
                                  (Booked)
                                </span>
                              )}
                              {!slot.isAvailable && !slot.isBooked && (
                                <span style={{ fontSize: '0.65rem', color: '#64748B', marginLeft: '0.35rem' }}>
                                  (Busy)
                                </span>
                              )}
                            </button>
                          );
                        })
                      ) : (
                        (meta?.timeSlots || [
                          '09:00 AM',
                          '10:00 AM',
                          '11:00 AM',
                          '02:00 PM',
                          '03:00 PM',
                          '04:00 PM',
                          '05:00 PM',
                        ]).map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            className={`app-slot-btn ${
                              timeSlot === slot ? 'selected' : ''
                            }`}
                            onClick={() => setTimeSlot(slot)}
                          >
                            {slot}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Meeting Mode Selection */}
              <div className="app-form-section">
                <div className="app-form-section-label">
                  <span>4. Meeting Mode</span>
                </div>
                <div className="app-mode-grid">
                  <div
                    className={`app-mode-card ${
                      meetingMode === 'ONLINE_COUNSELLING' ? 'selected' : ''
                    }`}
                    onClick={() => setMeetingMode('ONLINE_COUNSELLING')}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: 'rgba(91, 79, 233, 0.1)',
                        color: '#5B4FE9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Video size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#172033' }}>
                        Online Video Counselling
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#64748B' }}>
                        Google Meet / Zoom direct encrypted link
                      </div>
                    </div>
                  </div>

                  <div
                    className={`app-mode-card ${
                      meetingMode === 'IN_PERSON' ? 'selected' : ''
                    }`}
                    onClick={() => setMeetingMode('IN_PERSON')}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: 'rgba(91, 79, 233, 0.1)',
                        color: '#5B4FE9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <MapPin size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#172033' }}>
                        In-Person Campus Advisory
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#64748B' }}>
                        Superconsciousness Guidance Center Office
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 6. Shortlisted College Context (Module 6 & 12 Integration) */}
              <div className="app-form-section">
                <div className="app-form-section-label">
                  <span>5. Link Shortlisted College Context (Optional)</span>
                </div>
                <select
                  className="app-select"
                  value={relatedCollegeId}
                  onChange={(e) => setRelatedCollegeId(e.target.value)}
                >
                  <option value="">-- No specific college (General Advisory) --</option>
                  {shortlists.map((college) => (
                    <option key={college.institutionId} value={college.institutionId}>
                      {college.name} ({college.city}, {college.country}) &bull; {college.fitCategory} Fit
                    </option>
                  ))}
                </select>
                {selectedCollegeObj && (
                  <div
                    style={{
                      marginTop: '0.6rem',
                      padding: '0.6rem 0.85rem',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>
                      Selected context: <strong>{selectedCollegeObj.name}</strong> ({selectedCollegeObj.country})
                    </span>
                    <span className={`fit-category-pill fit-${selectedCollegeObj.fitCategory.toLowerCase()}`}>
                      {selectedCollegeObj.fitCategory}
                    </span>
                  </div>
                )}
              </div>

              {/* 7. Student Notes / Discussion Topic */}
              <div className="app-form-section">
                <div className="app-form-section-label">
                  <span>6. Questions or Notes for Counsellor (Optional)</span>
                </div>
                <textarea
                  className="app-textarea"
                  placeholder="e.g., Please review my 12th PCM cutoff eligibility for computer science programs and help evaluate merit scholarship deadlines."
                  value={studentNotes}
                  onChange={(e) => setStudentNotes(e.target.value)}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="app-btn-submit"
                disabled={
                  submittingBooking ||
                  (user?.role === 'STUDENT' && !meta?.assignedCounsellor) ||
                  (user?.role === 'STUDENT' && verificationStatus !== undefined && verificationStatus !== 'VERIFIED')
                }
                style={{
                  cursor:
                    (user?.role === 'STUDENT' && !meta?.assignedCounsellor) ||
                    (user?.role === 'STUDENT' && verificationStatus !== undefined && verificationStatus !== 'VERIFIED')
                      ? 'not-allowed'
                      : 'pointer',
                  opacity:
                    (user?.role === 'STUDENT' && !meta?.assignedCounsellor) ||
                    (user?.role === 'STUDENT' && verificationStatus !== undefined && verificationStatus !== 'VERIFIED')
                      ? 0.6
                      : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                {submittingBooking ? (
                  <span>Reserving Appointment Slot...</span>
                ) : user?.role === 'STUDENT' && verificationStatus !== undefined && verificationStatus !== 'VERIFIED' ? (
                  <>
                    <Lock size={16} />
                    <span>Admin Verification Required to Schedule</span>
                  </>
                ) : user?.role === 'STUDENT' && !meta?.assignedCounsellor ? (
                  <span>Awaiting Counsellor Assignment</span>
                ) : (
                  <>
                    <span>Book Appointment Session</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT: BOOKING SUMMARY & PREVIEW */}
          <div className="app-summary-card">
            <div className="app-summary-header">
              <h3 className="app-summary-title">Booking Overview</h3>
              <p className="app-summary-desc">Live preview of your chosen session</p>
            </div>

            <div className="app-summary-row">
              <span className="app-summary-label">Session Focus</span>
              <span className="app-summary-value">
                {appointmentTypesList.find((t) => t.type === bookingType)?.label}
              </span>
            </div>

            <div className="app-summary-row">
              <span className="app-summary-label">Assigned Counsellor</span>
              <span className="app-summary-value">
                {currentCounsellor ? currentCounsellor.fullName : 'Selected upon booking'}
              </span>
            </div>

            <div className="app-summary-row">
              <span className="app-summary-label">Scheduled Date</span>
              <span className="app-summary-value">{scheduledDate}</span>
            </div>

            <div className="app-summary-row">
              <span className="app-summary-label">Time Slot</span>
              <span className="app-summary-value">{timeSlot}</span>
            </div>

            <div className="app-summary-row">
              <span className="app-summary-label">Format</span>
              <span className="app-summary-value">
                {meetingMode === 'ONLINE_COUNSELLING' ? 'Online Video' : 'In-Person Campus'}
              </span>
            </div>

            {selectedCollegeObj && (
              <div className="app-summary-row">
                <span className="app-summary-label">College Context</span>
                <span className="app-summary-value">{selectedCollegeObj.name}</span>
              </div>
            )}

            <div style={{ marginTop: '1.5rem', background: '#F8FAFC', padding: '1rem', borderRadius: '10px', fontSize: '0.78rem', color: '#64748B', lineHeight: 1.5 }}>
              <div style={{ fontWeight: 700, color: '#172033', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle size={14} color="#16A34A" />
                <span>Superconsciousness Advisory Guarantee</span>
              </div>
              All consultations are complimentary for registered students. Rescheduling is permitted up to 2 hours prior to start time.
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 2: MY APPOINTMENTS
         ==================================================================== */}
      {activeTab === 'my-appointments' && (
        <div className="app-card">
          <div className="app-filter-bar">
            <div>
              <h2 className="app-card-title" style={{ margin: 0 }}>
                <CalendarCheck size={20} color="#5B4FE9" />
                <span>My Counselling Appointments</span>
              </h2>
              <span style={{ fontSize: '0.84rem', color: '#64748B' }}>
                Track upcoming appointments, join online sessions, or view consultation notes
              </span>
            </div>

            <div className="app-filter-pills">
              <button
                className={`app-filter-pill ${appointmentFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setAppointmentFilter('ALL')}
              >
                All ({appointments.length})
              </button>
              <button
                className={`app-filter-pill ${appointmentFilter === 'UPCOMING' ? 'active' : ''}`}
                onClick={() => setAppointmentFilter('UPCOMING')}
              >
                Upcoming
              </button>
              <button
                className={`app-filter-pill ${appointmentFilter === 'PAST' ? 'active' : ''}`}
                onClick={() => setAppointmentFilter('PAST')}
              >
                Past
              </button>
              <button
                className={`app-filter-pill ${appointmentFilter === 'CANCELLED' ? 'active' : ''}`}
                onClick={() => setAppointmentFilter('CANCELLED')}
              >
                Cancelled
              </button>
            </div>
          </div>

          {filteredAppointments.length > 0 ? (
            <div className="app-grid">
              {filteredAppointments.map((app) => {
                const isCancelled = app.status === 'CANCELLED';
                const isCompleted = app.status === 'COMPLETED';
                const formattedDate = new Date(app.scheduledAt).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
                const formattedTime = new Date(app.scheduledAt).toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div key={app.id} className="app-item-card">
                    <div>
                      <div className="app-item-header">
                        <span className="app-item-id">#{app.id.slice(-6).toUpperCase()}</span>
                        <span className={`app-badge-status status-${app.status.toLowerCase()}`}>
                          {app.status === 'CONFIRMED' && <CheckCircle size={12} />}
                          {app.status === 'SCHEDULED' && <Clock size={12} />}
                          {app.status === 'CANCELLED' && <X size={12} />}
                          <span>{app.status}</span>
                        </span>
                      </div>

                      <h3 className="app-item-title">{app.title}</h3>

                      <div className="app-item-meta">
                        <div className="app-item-meta-row">
                          <User size={14} color="#64748B" />
                          <span>
                            Counsellor: <strong>{app.counsellorName}</strong>
                          </span>
                        </div>

                        <div className="app-item-meta-row">
                          <Clock size={14} color="#64748B" />
                          <span>
                            {formattedDate} &bull; {formattedTime} ({app.durationMinutes} min)
                          </span>
                        </div>

                        <div className="app-item-meta-row">
                          {app.meetingType === 'ONLINE_COUNSELLING' ? (
                            <Video size={14} color="#5B4FE9" />
                          ) : (
                            <MapPin size={14} color="#059669" />
                          )}
                          <span>
                            Mode:{' '}
                            <strong>
                              {app.meetingType === 'ONLINE_COUNSELLING'
                                ? 'Online Video Meet'
                                : 'In-Person Campus'}
                            </strong>
                          </span>
                        </div>
                      </div>

                      {app.relatedCollegeName && (
                        <div className="app-item-college-tag">
                          <Bookmark size={12} color="#5B4FE9" />
                          <span>Context: {app.relatedCollegeName}</span>
                        </div>
                      )}
                    </div>

                    <div className="app-item-actions">
                      <button
                        className="app-btn-outline"
                        onClick={() => setSelectedAppointment(app)}
                      >
                        <Info size={14} />
                        <span>View Details</span>
                      </button>

                      {!isCancelled && !isCompleted && (
                        <button
                          className="app-btn-danger-outline"
                          onClick={() => setCancellingAppointment(app)}
                        >
                          Cancel
                        </button>
                      )}

                      {(app.status === 'CONFIRMED' || app.status === 'SCHEDULED') && (
                        <button
                          onClick={() => setActiveMeetingAppointment(app)}
                          className="app-btn-outline"
                          style={{ color: '#2563EB', borderColor: '#BFDBFE', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                          type="button"
                        >
                          <Video size={14} />
                          <span>Join Live Meeting</span>
                        </button>
                      )}

                      {isCompleted && (
                        <button
                          onClick={() => setViewSessionRecord(app)}
                          className="app-btn-outline"
                          style={{ color: '#16A34A', borderColor: '#BBF7D0', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                          type="button"
                        >
                          <CheckCircle size={14} />
                          <span>View Session Notes</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="app-empty-state">
              <div className="app-empty-icon">
                <Calendar size={28} />
              </div>
              <h3 className="app-empty-title">No appointments found</h3>
              <p className="app-empty-desc">
                {appointmentFilter === 'ALL'
                  ? 'You have not booked any counselling appointments yet. Connect with our certified advisors to plan your university roadmap.'
                  : `No appointments matching the "${appointmentFilter.toLowerCase()}" filter.`}
              </p>
              <button
                className="cmd-btn-primary"
                style={{ margin: '0 auto' }}
                onClick={() => setActiveTab('book')}
              >
                <span>Book a Consultation Session</span>
                <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          TAB 3: WEBINARS & ADMISSION MASTERCLASSES
         ==================================================================== */}
      {activeTab === 'webinars' && (
        <div className="app-card">
          <div className="app-filter-bar">
            <div>
              <h2 className="app-card-title" style={{ margin: 0 }}>
                <Video size={20} color="#5B4FE9" />
                <span>Admissions Webinars & Masterclasses</span>
              </h2>
              <span style={{ fontSize: '0.84rem', color: '#64748B' }}>
                Interactive live sessions and university masterclasses with admissions deans
              </span>
            </div>

            <div className="app-filter-pills">
              <button
                className={`app-filter-pill ${webinarFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setWebinarFilter('ALL')}
              >
                All Sessions ({webinars.length})
              </button>
              <button
                className={`app-filter-pill ${webinarFilter === 'REGISTERED' ? 'active' : ''}`}
                onClick={() => setWebinarFilter('REGISTERED')}
              >
                My Registrations ({registeredWebinarCount})
              </button>
              <button
                className={`app-filter-pill ${webinarFilter === 'UPCOMING' ? 'active' : ''}`}
                onClick={() => setWebinarFilter('UPCOMING')}
              >
                Live / Upcoming
              </button>
              <button
                className={`app-filter-pill ${webinarFilter === 'RECORDED' ? 'active' : ''}`}
                onClick={() => setWebinarFilter('RECORDED')}
              >
                Recorded Library
              </button>
            </div>
          </div>

          {filteredWebinars.length > 0 ? (
            <div className="app-grid">
              {filteredWebinars.map((webinar) => {
                const isUpcoming = webinar.webinarType === 'UPCOMING';
                const formattedDate = webinar.scheduledAt
                  ? new Date(webinar.scheduledAt).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'On-Demand';
                const formattedTime = webinar.scheduledAt
                  ? new Date(webinar.scheduledAt).toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '';

                return (
                  <div key={webinar.id} className="webinar-card">
                    <div>
                      <div className="webinar-top-tags">
                        <span className="webinar-topic-pill">{webinar.topic}</span>
                        {webinar.isRegistered ? (
                          <span className="webinar-registered-badge">
                            <CheckCircle size={11} />
                            <span>Registered</span>
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: '0.74rem',
                              color: isUpcoming ? '#2563EB' : '#475569',
                              fontWeight: 700,
                            }}
                          >
                            {isUpcoming ? '• Live Interactive' : '• On-Demand'}
                          </span>
                        )}
                      </div>

                      <h3 className="webinar-title">{webinar.title}</h3>
                      <p className="webinar-desc">{webinar.description}</p>

                      {/* Speaker Strip */}
                      <div className="webinar-speaker-strip">
                        <div className="webinar-speaker-avatar">
                          {(webinar.speakerName || 'W').charAt(0)}
                        </div>
                        <div>
                          <h5 className="webinar-speaker-name">{webinar.speakerName}</h5>
                          <span className="webinar-speaker-title">
                            {webinar.speakerTitle || 'Admissions Specialist'}
                          </span>
                        </div>
                      </div>

                      {/* Time & Duration */}
                      <div className="webinar-info-strip">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Calendar size={13} color="#64748B" />
                          <span>{formattedDate} {formattedTime && `at ${formattedTime}`}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Clock size={13} color="#64748B" />
                          <span>{webinar.durationMinutes} mins</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Users size={13} color="#64748B" />
                          <span>{webinar.registeredCount} Students Enrolled</span>
                        </div>
                      </div>
                    </div>

                    <div className="webinar-footer-actions">
                      {webinar.isRegistered ? (
                        <>
                          <a
                            href={webinar.officialLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="app-btn-outline"
                            style={{ color: '#5B4FE9', borderColor: '#C7D2FE', fontWeight: 700 }}
                          >
                            <ExternalLink size={14} />
                            <span>Join Meeting Room</span>
                          </a>
                          <button
                            className="app-btn-danger-outline"
                            onClick={() => handleCancelWebinarRegistration(webinar)}
                            disabled={actionLoadingId === webinar.id}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          className="cmd-btn-primary"
                          style={{ width: '100%', justifyContent: 'center' }}
                          onClick={() => handleRegisterWebinar(webinar)}
                          disabled={actionLoadingId === webinar.id}
                        >
                          {actionLoadingId === webinar.id ? (
                            <span>Registering...</span>
                          ) : (
                            <>
                              <span>Register for Free</span>
                              <ChevronRight size={15} />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="app-empty-state">
              <div className="app-empty-icon">
                <Video size={28} />
              </div>
              <h3 className="app-empty-title">No webinars found</h3>
              <p className="app-empty-desc">
                {webinarFilter === 'REGISTERED'
                  ? 'You have not registered for any webinars yet. Browse our upcoming sessions and claim your free seat.'
                  : 'No masterclasses found matching the selected filter.'}
              </p>
              {webinarFilter === 'REGISTERED' && (
                <button
                  className="cmd-btn-primary"
                  style={{ margin: '0 auto' }}
                  onClick={() => setWebinarFilter('ALL')}
                >
                  View All Masterclasses
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          TAB 4: SHORTLIST INTEGRATION (MODULE 6 & 12)
         ==================================================================== */}
      {activeTab === 'shortlist' && (
        <div className="app-card">
          <div className="app-filter-bar">
            <div>
              <h2 className="app-card-title" style={{ margin: 0 }}>
                <Bookmark size={20} color="#5B4FE9" />
                <span>My University Shortlist & Context Hub</span>
              </h2>
              <span style={{ fontSize: '0.84rem', color: '#64748B' }}>
                Institutions saved from College Discovery and Three-Tier fit. Click any college to book a targeted counselling session.
              </span>
            </div>

            <div className="app-filter-pills">
              <button
                className={`app-filter-pill ${shortlistFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setShortlistFilter('ALL')}
              >
                All ({shortlistMetrics.total})
              </button>
              <button
                className={`app-filter-pill ${shortlistFilter === 'DREAM' ? 'active' : ''}`}
                onClick={() => setShortlistFilter('DREAM')}
              >
                Dream ({shortlistMetrics.dream})
              </button>
              <button
                className={`app-filter-pill ${shortlistFilter === 'REACH' ? 'active' : ''}`}
                onClick={() => setShortlistFilter('REACH')}
              >
                Reach ({shortlistMetrics.reach})
              </button>
              <button
                className={`app-filter-pill ${shortlistFilter === 'TARGET' ? 'active' : ''}`}
                onClick={() => setShortlistFilter('TARGET')}
              >
                Target ({shortlistMetrics.target})
              </button>
              <button
                className={`app-filter-pill ${shortlistFilter === 'SAFE' ? 'active' : ''}`}
                onClick={() => setShortlistFilter('SAFE')}
              >
                Safe ({shortlistMetrics.safe})
              </button>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="shortlist-stats-banner">
            <div className="shortlist-stat-box">
              <div className="shortlist-stat-num">{shortlistMetrics.total}</div>
              <div className="shortlist-stat-label">Total Shortlisted</div>
            </div>
            <div className="shortlist-stat-box" style={{ borderLeft: '3px solid #C084FC' }}>
              <div className="shortlist-stat-num" style={{ color: '#9333EA' }}>
                {shortlistMetrics.dream}
              </div>
              <div className="shortlist-stat-label">Dream Tier</div>
            </div>
            <div className="shortlist-stat-box" style={{ borderLeft: '3px solid #60A5FA' }}>
              <div className="shortlist-stat-num" style={{ color: '#2563EB' }}>
                {shortlistMetrics.reach}
              </div>
              <div className="shortlist-stat-label">Reach Tier</div>
            </div>
            <div className="shortlist-stat-box" style={{ borderLeft: '3px solid #34D399' }}>
              <div className="shortlist-stat-num" style={{ color: '#059669' }}>
                {shortlistMetrics.target}
              </div>
              <div className="shortlist-stat-label">Target Tier</div>
            </div>
          </div>

          {filteredShortlists.length > 0 ? (
            <div className="app-grid">
              {filteredShortlists.map((college) => (
                <div key={college.institutionId || college.id} className="shortlist-college-card">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span className={`fit-category-pill fit-${college.fitCategory.toLowerCase()}`}>
                        {college.fitCategory} FIT
                      </span>
                      <span style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 600 }}>
                        {college.tier}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: 750, color: '#172033', margin: '0 0 0.35rem 0' }}>
                      {college.name}
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#64748B', marginBottom: '1rem' }}>
                      <MapPin size={13} />
                      <span>{college.city}, {college.country}</span>
                    </div>

                    <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', color: '#334155', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Acceptance Rate</div>
                        <div style={{ fontWeight: 700 }}>{college.acceptanceRate || 'Competitive'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Est. Annual Fee</div>
                        <div style={{ fontWeight: 700 }}>{college.avgTuitionFee || 'Available on enquiry'}</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9' }}>
                    <button
                      className="cmd-btn-primary"
                      style={{ width: '100%', justifyContent: 'center' }}
                      onClick={() => handleBookForCollege(college)}
                    >
                      <CalendarPlus size={15} />
                      <span>Book Consultation for this College</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="app-empty-state">
              <div className="app-empty-icon">
                <Bookmark size={28} />
              </div>
              <h3 className="app-empty-title">No universities shortlisted</h3>
              <p className="app-empty-desc">
                Explore the College Discovery catalog and Three-Tier fit recommendation engine to add colleges to your official shortlist.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          MODAL 1: VIEW APPOINTMENT DETAILS
         ==================================================================== */}
      {selectedAppointment && (
        <div className="app-modal-overlay" onClick={() => setSelectedAppointment(null)}>
          <div className="app-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="app-modal-close" onClick={() => setSelectedAppointment(null)}>
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(91, 79, 233, 0.1)',
                  color: '#5B4FE9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CalendarCheck size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#172033', margin: 0 }}>
                  Appointment Details
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  ID: #{selectedAppointment.id}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ color: '#64748B' }}>Session Topic:</span>
                <span style={{ fontWeight: 700, color: '#172033' }}>{selectedAppointment.title}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ color: '#64748B' }}>Status:</span>
                <span className={`app-badge-status status-${selectedAppointment.status.toLowerCase()}`}>
                  {selectedAppointment.status}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ color: '#64748B' }}>Assigned Counsellor:</span>
                <span style={{ fontWeight: 600, color: '#172033' }}>
                  {selectedAppointment.counsellorName} ({selectedAppointment.counsellorEmail})
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ color: '#64748B' }}>Date & Time:</span>
                <span style={{ fontWeight: 600, color: '#172033' }}>
                  {new Date(selectedAppointment.scheduledAt).toLocaleString()}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ color: '#64748B' }}>Meeting Format:</span>
                <span style={{ fontWeight: 600, color: '#172033' }}>
                  {selectedAppointment.meetingType === 'ONLINE_COUNSELLING'
                    ? 'Online Video Call'
                    : 'In-Person Campus Advisory'}
                </span>
              </div>

              {selectedAppointment.relatedCollegeName && (
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #F1F5F9' }}>
                  <span style={{ color: '#64748B' }}>Referenced College:</span>
                  <span style={{ fontWeight: 700, color: '#5B4FE9' }}>
                    {selectedAppointment.relatedCollegeName}
                  </span>
                </div>
              )}

              {selectedAppointment.studentNotes && (
                <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
                    Your Discussion Notes:
                  </div>
                  <div style={{ color: '#172033', fontSize: '0.84rem' }}>
                    {selectedAppointment.studentNotes}
                  </div>
                </div>
              )}

              {selectedAppointment.cancellationReason && (
                <div style={{ background: '#FEF2F2', padding: '0.85rem', borderRadius: '8px', color: '#991B1B' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    Cancellation Reason:
                  </div>
                  <div style={{ fontSize: '0.84rem' }}>
                    {selectedAppointment.cancellationReason}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {selectedAppointment.meetingType === 'ONLINE_COUNSELLING' &&
                selectedAppointment.status !== 'CANCELLED' && (
                  <a
                    href={selectedAppointment.meetingLocation || 'https://meet.google.com'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cmd-btn-primary"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <Video size={16} />
                    <span>Join Video Meeting</span>
                  </a>
                )}
              <button
                className="app-btn-outline"
                style={{ flex: 1 }}
                onClick={() => setSelectedAppointment(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 2: CANCEL APPOINTMENT CONFIRMATION
         ==================================================================== */}
      {cancellingAppointment && (
        <div className="app-modal-overlay" onClick={() => setCancellingAppointment(null)}>
          <div className="app-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="app-modal-close" onClick={() => setCancellingAppointment(null)}>
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: '#FEE2E2',
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#172033', margin: 0 }}>
                  Cancel Appointment?
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  #{cancellingAppointment.id.slice(-6).toUpperCase()} &bull; {cancellingAppointment.title}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Are you sure you want to cancel this counselling session? Your reserved slot will be released back into the counsellor schedule.
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#475569',
                  marginBottom: '0.4rem',
                }}
              >
                Reason for cancellation (Optional)
              </label>
              <textarea
                className="app-textarea"
                rows={3}
                placeholder="e.g., Schedule conflict, already resolved question, or rescheduling for next week."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="app-btn-outline"
                style={{ flex: 1 }}
                onClick={() => setCancellingAppointment(null)}
              >
                Keep Appointment
              </button>
              <button
                className="app-btn-danger-outline"
                style={{ flex: 1, padding: '0.75rem', background: '#DC2626', color: '#FFFFFF', border: 'none' }}
                onClick={handleConfirmCancelAppointment}
                disabled={actionLoadingId === cancellingAppointment.id}
              >
                {actionLoadingId === cancellingAppointment.id ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeMeetingAppointment && (
        <InteractiveMeetingModal
          appointment={activeMeetingAppointment}
          userRole="STUDENT"
          onClose={() => setActiveMeetingAppointment(null)}
        />
      )}

      {viewSessionRecord && (
        <SessionAuditDetailsModal
          session={viewSessionRecord}
          onClose={() => setViewSessionRecord(null)}
        />
      )}

      {/* Consultancy Enrollment & Policy Agreement Modal (PDF Requirement) */}
      {enrollmentModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001,
            padding: '1rem',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '580px',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#F8FAFC',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '8px',
                    backgroundColor: '#EFF6FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2563EB',
                  }}
                >
                  <Award size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
                    Consultancy Enrollment & Policy Agreement
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B' }}>
                    Official consultancy registration for your chosen university admission
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEnrollmentModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                type="button"
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div
                style={{
                  padding: '0.85rem 1rem',
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  color: '#1E40AF',
                  lineHeight: 1.5,
                }}
              >
                <strong>Company Policy & Guaranteed Admission Guidance:</strong> When enrolled, our certified educational consultants process your applications end-to-end, assist with scholarships, and provide verified guidance to prevent fake admissions.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.82rem', color: '#334155' }}>
                  <CheckCircle size={16} color="#16A34A" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span><strong>Dedicated Counsellor Token:</strong> Your assigned counsellor receives official performance points to oversee your admission from university shortlist to enrollment.</span>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.82rem', color: '#334155' }}>
                  <CheckCircle size={16} color="#16A34A" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span><strong>Verified University Submissions:</strong> Official document dispatch preventing fraudulent or duplicate university filings.</span>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.82rem', color: '#334155' }}>
                  <CheckCircle size={16} color="#16A34A" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span><strong>Transparent Support:</strong> All advisory sessions and progress are audited by central administration.</span>
                </div>
              </div>

              <div
                style={{
                  padding: '0.85rem 1rem',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <input
                  type="checkbox"
                  id="agreeCheckbox"
                  style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#2563EB' }}
                  checked={agreedToPolicies}
                  onChange={(e) => setAgreedToPolicies(e.target.checked)}
                />
                <label htmlFor="agreeCheckbox" style={{ fontSize: '0.82rem', color: '#0F172A', cursor: 'pointer', fontWeight: 600 }}>
                  I accept the Superconsciousness Company Agreement and Admissions Policies
                </label>
              </div>
            </div>

            <div
              style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
              }}
            >
              <button
                type="button"
                onClick={() => setEnrollmentModalOpen(false)}
                className="saas-btn saas-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmEnrollment}
                disabled={submittingEnrollment || !agreedToPolicies}
                className="saas-btn saas-btn-primary"
                style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
              >
                {submittingEnrollment ? 'Enrolling...' : 'Confirm Official Enrollment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

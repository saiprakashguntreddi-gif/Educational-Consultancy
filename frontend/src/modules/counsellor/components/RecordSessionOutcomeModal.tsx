import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { AppointmentsService } from '../../appointments/services/appointments.service';

interface RecordSessionOutcomeModalProps {
  appointment: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const RecordSessionOutcomeModal: React.FC<RecordSessionOutcomeModalProps> = ({
  appointment,
  onClose,
  onSuccess,
}) => {
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [sessionOutcome, setSessionOutcome] = useState(
    'Student evaluated international undergraduate choices. Recommended 3 Target universities and clarified IELTS minimum scores.'
  );
  const [recommendations, setRecommendations] = useState(
    '1. Finalize Statement of Purpose by next Friday.\n2. Complete practice mock test for IELTS.\n3. Request recommendation letters from high school counselors.'
  );
  const [followUpRequired, setFollowUpRequired] = useState(true);
  const [nextAction, setNextAction] = useState('Review revised SOP draft and verify transcripts');
  const [counsellorNotes, setCounsellorNotes] = useState('Student showed strong academic readiness and enthusiastic focus on STEM.');

  // Student Interest & Report Fields (Per PDF Specification)
  const [studentInterest, setStudentInterest] = useState<'INTERESTED' | 'NOT_INTERESTED' | 'UNDECIDED'>('INTERESTED');
  const [targetStream, setTargetStream] = useState('Computer Science & Information Technology');
  const [targetDepartments, setTargetDepartments] = useState('Artificial Intelligence & Software Engineering');
  const [targetColleges, setTargetColleges] = useState('Stanford, Carnegie Mellon, University of Toronto');
  const [targetCity, setTargetCity] = useState('California / Toronto');
  const [studyScope, setStudyScope] = useState<'DOMESTIC' | 'INTERNATIONAL' | 'BOTH'>('INTERNATIONAL');
  const [detailedInterestReport, setDetailedInterestReport] = useState(
    'Student is actively seeking Fall intake admission in leading global universities. Expressed high interest in consultancy assistance for application essays, scholarship matching, and visa filing.'
  );
  const [sendPolicyViaWhatsApp, setSendPolicyViaWhatsApp] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const now = new Date();
    const startTime = new Date(now.getTime() - durationMinutes * 60 * 1000);

    try {
      const res = await AppointmentsService.recordSessionOutcome(appointment.id, {
        actualStartTime: startTime.toISOString(),
        actualEndTime: now.toISOString(),
        durationMinutes: Number(durationMinutes),
        sessionOutcome,
        recommendations,
        followUpRequired,
        nextAction: followUpRequired ? nextAction : undefined,
        privateCounsellorNotes: counsellorNotes,
        studentInterest,
        targetStream,
        targetDepartments,
        targetColleges,
        targetCity,
        studyScope,
        detailedInterestReport,
        sendPolicyViaWhatsApp,
      });

      if (res.success) {
        if (res.data?.whatsappPolicyLink) {
          window.open(res.data.whatsappPolicyLink, '_blank');
        }
        onSuccess();
        onClose();
      } else {
        setError(res.message || 'Failed to record session outcome');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred while saving session record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const studentName = appointment?.studentProfile?.fullName || appointment?.studentName || 'Student';

  return (
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
          maxWidth: '640px',
          maxHeight: '92vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
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
                backgroundColor: '#ECFDF5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10B981',
              }}
            >
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>
                Record Session Outcome & Follow-up
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>
                Official counselling record with {studentName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
          <div
            style={{
              padding: '1.5rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.15rem',
              flex: 1,
            }}
          >
            {error && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  borderRadius: '6px',
                  color: '#B91C1C',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Duration */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                Actual Session Duration (Minutes) *
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="number"
                  min={5}
                  max={300}
                  required
                  style={{
                    width: 140,
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    color: '#0F172A',
                  }}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                />
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>minutes elapsed</span>
              </div>
            </div>

            {/* Session Outcome */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                Session Outcome & Deliberations Summary *
              </label>
              <textarea
                rows={3}
                required
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  color: '#0F172A',
                  resize: 'vertical',
                }}
                placeholder="Detail what was discussed, clarified, or decided during the appointment..."
                value={sessionOutcome}
                onChange={(e) => setSessionOutcome(e.target.value)}
              />
            </div>

            {/* Recommendations */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                Actionable Recommendations for Student
              </label>
              <textarea
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  color: '#0F172A',
                  resize: 'vertical',
                }}
                placeholder="Specific guidance steps, test preparations, or documents required..."
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
              />
            </div>

            {/* Follow-up Required Toggle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
              }}
            >
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#0F172A', display: 'block' }}>
                  Follow-up Consultation Required?
                </strong>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  Flags this student for milestone monitoring on your dashboard and admin audit
                </span>
              </div>
              <input
                type="checkbox"
                style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#2563EB' }}
                checked={followUpRequired}
                onChange={(e) => setFollowUpRequired(e.target.checked)}
              />
            </div>

            {/* Next Action */}
            {followUpRequired && (
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                  Next Follow-up Action / Milestone
                </label>
                <input
                  type="text"
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.8rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    color: '#0F172A',
                  }}
                  placeholder="e.g. Verify English proficiency test scores on next session"
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                />
              </div>
            )}

            {/* Student Interest & Report for Admin Audit (PDF Requirement) */}
            <div
              style={{
                padding: '1.15rem',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
                  Student Interest & Admin Audit Report
                </span>
                <span style={{ fontSize: '0.72rem', color: '#2563EB', backgroundColor: '#EFF6FF', padding: '0.2rem 0.5rem', borderRadius: 4, fontWeight: 600 }}>
                  Audited by Admin
                </span>
              </div>

              {/* Student Interest Decision */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                  Student Interest Level with Consultancy *
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    color: '#0F172A',
                    backgroundColor: '#FFFFFF',
                  }}
                  value={studentInterest}
                  onChange={(e: any) => setStudentInterest(e.target.value)}
                >
                  <option value="INTERESTED">Interested — Confirmed to proceed with our consultancy</option>
                  <option value="UNDECIDED">Undecided — Needs further counselling & follow-up</option>
                  <option value="NOT_INTERESTED">Not Interested — Decided not to move with our consultancy</option>
                </select>
              </div>

              {/* Target Stream and Scope */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                    Target Academic Stream *
                  </label>
                  <input
                    type="text"
                    required
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      color: '#0F172A',
                    }}
                    placeholder="e.g. Computer Science & Engineering"
                    value={targetStream}
                    onChange={(e) => setTargetStream(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                    Study Scope *
                  </label>
                  <select
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      color: '#0F172A',
                      backgroundColor: '#FFFFFF',
                    }}
                    value={studyScope}
                    onChange={(e: any) => setStudyScope(e.target.value)}
                  >
                    <option value="INTERNATIONAL">International (Overseas)</option>
                    <option value="DOMESTIC">Domestic (In-country)</option>
                    <option value="BOTH">Both International & Domestic</option>
                  </select>
                </div>
              </div>

              {/* Target Departments & Target Colleges */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                    Departments / Majors *
                  </label>
                  <input
                    type="text"
                    required
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      color: '#0F172A',
                    }}
                    placeholder="e.g. AI, Data Science, Mechanical"
                    value={targetDepartments}
                    onChange={(e) => setTargetDepartments(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                    Target Colleges / Universities *
                  </label>
                  <input
                    type="text"
                    required
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      color: '#0F172A',
                    }}
                    placeholder="e.g. Stanford, Toronto, NUS"
                    value={targetColleges}
                    onChange={(e) => setTargetColleges(e.target.value)}
                  />
                </div>
              </div>

              {/* Target City */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                  Target City / Region
                </label>
                <input
                  type="text"
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    color: '#0F172A',
                  }}
                  placeholder="e.g. Boston, London, Melbourne"
                  value={targetCity}
                  onChange={(e) => setTargetCity(e.target.value)}
                />
              </div>

              {/* Detailed Report for Admin */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                  Detailed Student Report for Admin Audit *
                </label>
                <textarea
                  rows={3}
                  required
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    color: '#0F172A',
                    resize: 'vertical',
                  }}
                  placeholder="Provide comprehensive details of student interest, readiness, budget discussions, or specific concerns for admin review..."
                  value={detailedInterestReport}
                  onChange={(e) => setDetailedInterestReport(e.target.value)}
                />
              </div>

              {/* WhatsApp Enrollment & Policies Dispatch Toggle */}
              {studentInterest === 'INTERESTED' && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    borderRadius: '6px',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#065F46', display: 'block' }}>
                      Send Official Enrollment & Policies via WhatsApp
                    </span>
                    <span style={{ fontSize: '0.74rem', color: '#047857' }}>
                      Dispatches verified terms to student's mobile to prevent fake enrollments
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    style={{ width: 17, height: 17, cursor: 'pointer', accentColor: '#10B981' }}
                    checked={sendPolicyViaWhatsApp}
                    onChange={(e) => setSendPolicyViaWhatsApp(e.target.checked)}
                  />
                </div>
              )}
            </div>

            {/* Counsellor Notes */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                Internal Advisory Notes (Auditable by Admin)
              </label>
              <textarea
                rows={2}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  color: '#0F172A',
                  resize: 'vertical',
                }}
                placeholder="Internal notes on student readiness, parent discussions, or financial considerations..."
                value={counsellorNotes}
                onChange={(e) => setCounsellorNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '0.55rem 1.15rem',
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                color: '#475569',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '0.55rem 1.35rem',
                backgroundColor: '#10B981',
                border: 'none',
                borderRadius: '6px',
                color: '#FFFFFF',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <CheckCircle2 size={16} />
              <span>{isSubmitting ? 'Recording Outcome...' : 'Save & Mark Completed'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

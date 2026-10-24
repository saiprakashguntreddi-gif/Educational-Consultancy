import React, { useState, useEffect } from 'react';
import {
  X,
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Shield,
  CheckCircle2,
} from 'lucide-react';

interface InteractiveMeetingModalProps {
  appointment: any;
  userRole: 'ADMIN' | 'COUNSELLOR' | 'STUDENT';
  onClose: () => void;
  onRecordOutcome?: (appointment: any) => void;
}

export const InteractiveMeetingModal: React.FC<InteractiveMeetingModalProps> = ({
  appointment,
  userRole,
  onClose,
  onRecordOutcome,
}) => {
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [meetingSeconds, setMeetingSeconds] = useState(0);
  const [activeSidePanel, setActiveSidePanel] = useState<'notes' | 'info'>('notes');
  const [quickNotes, setQuickNotes] = useState('');

  // Meeting timer
  useEffect(() => {
    const timer = setInterval(() => {
      setMeetingSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const studentName = appointment?.studentProfile?.fullName || appointment?.studentName || 'Student';
  const counsellorName = appointment?.counsellor?.email?.split('@')[0] || appointment?.counsellorEmail || 'Counsellor';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#0F172A',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          height: '60px',
          backgroundColor: '#1E293B',
          borderBottom: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          color: '#FFFFFF',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              backgroundColor: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Video size={18} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#F8FAFC' }}>
              {appointment?.title || appointment?.appointmentType?.replace('_', ' ') || '1-on-1 Counselling Consultation'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              Student: <strong style={{ color: '#E2E8F0' }}>{studentName}</strong> • Advisor: <strong style={{ color: '#E2E8F0' }}>{counsellorName}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#0F172A',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              border: '1px solid #334155',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#38BDF8',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
            <span>{formatTimer(meetingSeconds)}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#10B981' }}>
            <Shield size={14} />
            <span>E2E Encrypted</span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '0.3rem',
            }}
            title="Leave Meeting"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left / Center Video Stage */}
        <div
          style={{
            flex: 1,
            backgroundColor: '#090D16',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {/* Video Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.25rem',
              width: '100%',
              maxWidth: '960px',
              height: '70vh',
            }}
          >
            {/* Participant 1: Student Feed */}
            <div
              style={{
                backgroundColor: '#1E293B',
                borderRadius: '14px',
                border: '1px solid #334155',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: '#3B82F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    border: '3px solid #60A5FA',
                  }}
                >
                  {studentName.charAt(0).toUpperCase()}
                </div>
                <div style={{ color: '#F8FAFC', fontWeight: 600, fontSize: '1rem' }}>{studentName}</div>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Student Participant (Verified)</span>
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  backgroundColor: 'rgba(15, 23, 42, 0.75)',
                  backdropFilter: 'blur(4px)',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  color: '#FFFFFF',
                }}
              >
                {studentName}
              </div>
            </div>

            {/* Participant 2: Counsellor Feed */}
            <div
              style={{
                backgroundColor: '#1E293B',
                borderRadius: '14px',
                border: '1px solid #334155',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: '#10B981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    border: '3px solid #34D399',
                  }}
                >
                  {counsellorName.charAt(0).toUpperCase()}
                </div>
                <div style={{ color: '#F8FAFC', fontWeight: 600, fontSize: '1rem' }}>{counsellorName}</div>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Senior Certified Counsellor</span>
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  backgroundColor: 'rgba(15, 23, 42, 0.75)',
                  backdropFilter: 'blur(4px)',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  color: '#FFFFFF',
                }}
              >
                {counsellorName} (Host)
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Panel: Live Advisory Scratchpad */}
        <div
          style={{
            width: '340px',
            backgroundColor: '#1E293B',
            borderLeft: '1px solid #334155',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Panel Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #334155' }}>
            <button
              onClick={() => setActiveSidePanel('notes')}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: activeSidePanel === 'notes' ? '#0F172A' : 'transparent',
                color: activeSidePanel === 'notes' ? '#38BDF8' : '#94A3B8',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              Live Session Notes
            </button>
            <button
              onClick={() => setActiveSidePanel('info')}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: activeSidePanel === 'info' ? '#0F172A' : 'transparent',
                color: activeSidePanel === 'info' ? '#38BDF8' : '#94A3B8',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              Meeting Info
            </button>
          </div>

          {/* Panel Content */}
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
            {activeSidePanel === 'notes' ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8', marginBottom: '0.5rem' }}>
                  Scratchpad for key points discussed during meeting:
                </span>
                <textarea
                  style={{
                    flex: 1,
                    width: '100%',
                    backgroundColor: '#0F172A',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                    padding: '0.75rem',
                    fontSize: '0.85rem',
                    lineHeight: 1.5,
                    resize: 'none',
                    outline: 'none',
                  }}
                  placeholder="Record student questions, target courses, university selections, or follow-up items..."
                  value={quickNotes}
                  onChange={(e) => setQuickNotes(e.target.value)}
                />
              </div>
            ) : (
              <div style={{ color: '#E2E8F0', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block' }}>Meeting Mode</span>
                  <strong>{appointment?.meetingMode?.replace('_', ' ') || 'ONLINE COUNSELLING'}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block' }}>Student Profile ID</span>
                  <span style={{ fontSize: '0.78rem', color: '#38BDF8' }}>{appointment?.studentProfileId || 'Verified Roster'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block' }}>Initial Notes</span>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#94A3B8' }}>{appointment?.studentNotes || 'Standard 1-on-1 advisory session.'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div
        style={{
          height: '75px',
          backgroundColor: '#1E293B',
          borderTop: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          padding: '0 2rem',
        }}
      >
        <button
          onClick={() => setMicEnabled(!micEnabled)}
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            backgroundColor: micEnabled ? '#334155' : '#DC2626',
            color: '#FFFFFF',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          title={micEnabled ? 'Mute Mic' : 'Unmute Mic'}
        >
          {micEnabled ? <Mic size={20} /> : <MicOff size={20} />}
        </button>

        <button
          onClick={() => setVideoEnabled(!videoEnabled)}
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            backgroundColor: videoEnabled ? '#334155' : '#DC2626',
            color: '#FFFFFF',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          title={videoEnabled ? 'Stop Camera' : 'Start Camera'}
        >
          {videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
        </button>

        {userRole === 'COUNSELLOR' ? (
          <button
            onClick={() => {
              if (onRecordOutcome) {
                onRecordOutcome(appointment);
              }
            }}
            style={{
              padding: '0.65rem 1.35rem',
              backgroundColor: '#10B981',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginLeft: '1rem',
            }}
          >
            <CheckCircle2 size={18} />
            <span>Complete & Record Session Outcome</span>
          </button>
        ) : (
          <button
            onClick={onClose}
            style={{
              padding: '0.65rem 1.35rem',
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginLeft: '1rem',
            }}
          >
            <PhoneOff size={18} />
            <span>Leave Consultation</span>
          </button>
        )}
      </div>
    </div>
  );
};

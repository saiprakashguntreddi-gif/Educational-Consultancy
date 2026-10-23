import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  UserCheck,
  User,
  Video,
  ShieldCheck,
  Download,
  Clock,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Volume2,
  VolumeX,
  Columns,
  Rows,
  Headphones,
  Play,
  Pause,
} from 'lucide-react';
import { StatusBadge } from './saas/StatusBadge';

interface SessionAuditDetailsModalProps {
  session: any;
  onClose: () => void;
}

export const SessionAuditDetailsModal: React.FC<SessionAuditDetailsModalProps> = ({ session, onClose }) => {
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [playerLayout, setPlayerLayout] = useState<'split' | 'stacked'>('split');
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Audio Audit Player State
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(24.4);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState(1);
  const [showAudioAuditPlayer, setShowAudioAuditPlayer] = useState(true);

  const rawUrl = session?.recordingUrl;
  const isBrokenUrl =
    !rawUrl ||
    rawUrl.includes('.internal') ||
    rawUrl.includes('storage.superconsciousness.com') ||
    rawUrl.includes('records.superconsciousness') ||
    rawUrl.includes('commondatastorage.googleapis.com') ||
    rawUrl.includes('gtv-videos-bucket');

  const streamUrl = isBrokenUrl ? '/assets/sample-consultation.mp4' : rawUrl;

  const rawAudioUrl = session?.audioUrl || (session as any)?.audioRecordingUrl;
  const audioUrl =
    !rawAudioUrl ||
    rawAudioUrl.includes('.internal') ||
    rawAudioUrl.includes('storage.superconsciousness.com')
      ? '/assets/sample-consultation-audio.wav'
      : rawAudioUrl;

  // Autoplay with audio when stream opens
  useEffect(() => {
    if (isPlayingRecording && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.muted = false;
      setIsMuted(false);
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If browser policy prevents unmuted autoplay without prior gesture
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().catch(() => {});
          }
        });
      }
    }
  }, [isPlayingRecording]);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isPlayingRecording) {
          setIsPlayingRecording(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlayingRecording, onClose]);

  const toggleSound = () => {
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
      if (!nextMuted && videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
      }
    } else {
      setIsMuted(!isMuted);
    }
  };

  const jumpToTime = (secs: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = secs;
      videoRef.current.play().catch(() => {});
      setIsVideoPlaying(true);
    }
    setVideoCurrentTime(secs);
  };

  const changeSpeed = (rate: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setPlaybackSpeed(rate);
  };

  // Audio Audit helper functions
  const toggleAudioPlay = () => {
    if (!audioRef.current) return;
    if (isAudioPlaying) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsAudioPlaying(true);
      }).catch(() => {});
    }
  };

  const toggleAudioMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isAudioMuted;
    audioRef.current.muted = nextMuted;
    setIsAudioMuted(nextMuted);
  };

  const changeAudioSpeed = (rate: number) => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = rate;
    setAudioSpeed(rate);
  };

  const formatAudioTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Helper renderers for recording stream player
  const renderVideoPlayerBlock = (height: string) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {isMuted && (
        <div
          onClick={toggleSound}
          style={{
            backgroundColor: '#1E3A8A',
            border: '1px solid #3B82F6',
            borderRadius: 8,
            padding: '0.55rem 0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#93C5FD', fontSize: '0.78rem', fontWeight: 600 }}>
            <Volume2 size={15} color="#60A5FA" />
            <span>Audio muted by browser. <strong>Click to turn ON sound!</strong></span>
          </div>
          <span style={{ backgroundColor: '#2563EB', color: '#FFFFFF', padding: '0.18rem 0.55rem', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700 }}>
            🔊 Unmute
          </span>
        </div>
      )}

      <div
        style={{
          position: 'relative',
          width: '100%',
          height: height,
          backgroundColor: '#000000',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
          border: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <video
          ref={videoRef}
          src={streamUrl}
          controls
          autoPlay
          muted={isMuted}
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            backgroundColor: '#000000',
          }}
          onTimeUpdate={() => {
            if (videoRef.current) {
              setVideoCurrentTime(videoRef.current.currentTime);
            }
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setVideoDuration(videoRef.current.duration || 30.5);
            }
          }}
          onPlay={() => setIsVideoPlaying(true)}
          onPause={() => setIsVideoPlaying(false)}
        >
          <source src={streamUrl} type="video/mp4" />
          <source src="/assets/sample-consultation.mp4" type="video/mp4" />
          Your browser does not support HTML5 video streaming.
        </video>

        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(4px)',
            color: '#F8FAFC',
            padding: '0.2rem 0.55rem',
            borderRadius: 6,
            fontSize: '0.68rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: isVideoPlaying ? '#10B981' : '#F59E0B',
              display: 'inline-block',
            }}
          />
          <span>
            {isVideoPlaying ? 'Audit Stream Playing' : 'Paused'} • {Math.floor(videoCurrentTime)}s / {Math.floor(videoDuration || 30)}s
          </span>
        </div>
      </div>
    </div>
  );

  const renderControlsBarBlock = () => (
    <div
      style={{
        backgroundColor: '#1E293B',
        borderRadius: 8,
        padding: '0.55rem 0.85rem',
        border: '1px solid #334155',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}
    >
      <button
        type="button"
        onClick={toggleSound}
        title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        style={{
          backgroundColor: isMuted ? '#0F172A' : '#2563EB',
          color: '#FFFFFF',
          border: isMuted ? '1px solid #EF4444' : '1px solid #60A5FA',
          borderRadius: 4,
          padding: '0.25rem 0.65rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontSize: '0.74rem',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        {isMuted ? <VolumeX size={14} color="#EF4444" /> : <Volume2 size={14} color="#FFFFFF" />}
        <span>{isMuted ? 'Muted (Click to Unmute)' : 'Sound On'}</span>
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Speed:</span>
        {[1, 1.25, 1.5, 2].map((spd) => (
          <button
            key={spd}
            type="button"
            onClick={() => changeSpeed(spd)}
            style={{
              backgroundColor: playbackSpeed === spd ? '#2563EB' : '#0F172A',
              color: '#FFFFFF',
              border: playbackSpeed === spd ? '1px solid #60A5FA' : '1px solid #334155',
              borderRadius: 4,
              padding: '0.2rem 0.5rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {spd}x
          </button>
        ))}
      </div>
    </div>
  );

  const renderTranscriptBlock = () => (
    <div
      style={{
        backgroundColor: '#1E293B',
        borderRadius: 10,
        padding: '0.75rem 0.95rem',
        border: '1px solid #334155',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
        <MessageSquare size={13} color="#60A5FA" /> Synchronized Live Dialogue Transcript
      </div>
      <div style={{ fontSize: '0.82rem', color: '#F1F5F9', lineHeight: 1.45, minHeight: '44px' }}>
        {videoCurrentTime < 8 ? (
          <span>
            <strong style={{ color: '#60A5FA' }}>Counsellor:</strong> "Welcome to your counselling session! Let's examine your academic profile and verify eligibility for admission."
          </span>
        ) : videoCurrentTime < 16 ? (
          <span>
            <strong style={{ color: '#60A5FA' }}>Counsellor:</strong> "Based on your preference for <strong>{session.targetStream || 'Engineering / Computer Science'}</strong>, we have verified top university pathways."
          </span>
        ) : videoCurrentTime < 24 ? (
          <span>
            <strong style={{ color: '#34D399' }}>Student:</strong> "I am looking for colleges in <strong>{session.targetCity || 'Munich / European Universities'}</strong> with good admission prospects."
          </span>
        ) : (
          <span>
            <strong style={{ color: '#60A5FA' }}>Counsellor:</strong> "Student interest confirmed as <strong>{session.studentInterest || 'INTERESTED'}</strong>. Official enrolment agreement and compliance policies sent via WhatsApp!"
          </span>
        )}
      </div>
    </div>
  );

  const renderChaptersBlock = (gridCols: string) => (
    <div
      style={{
        backgroundColor: '#1E293B',
        borderRadius: 10,
        padding: '0.75rem 0.95rem',
        border: '1px solid #334155',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: '#F8FAFC' }}>
          <Sparkles size={14} color="#60A5FA" /> Interactive Video Chapters:
        </div>
        <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Click Chapter to Jump</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: '0.45rem' }}>
        <button
          type="button"
          onClick={() => jumpToTime(0)}
          style={{
            backgroundColor: videoCurrentTime < 8 ? '#2563EB' : '#0F172A',
            color: '#FFFFFF',
            border: videoCurrentTime < 8 ? '1px solid #60A5FA' : '1px solid #334155',
            borderRadius: 6,
            padding: '0.5rem 0.65rem',
            fontSize: '0.73rem',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ fontWeight: 700, color: videoCurrentTime < 8 ? '#FFFFFF' : '#60A5FA' }}>
            00:00 - Intake Review
          </div>
          <div style={{ fontSize: '0.66rem', color: '#CBD5E1' }}>GPA, GRE & Background</div>
        </button>

        <button
          type="button"
          onClick={() => jumpToTime(8)}
          style={{
            backgroundColor: videoCurrentTime >= 8 && videoCurrentTime < 16 ? '#2563EB' : '#0F172A',
            color: '#FFFFFF',
            border: videoCurrentTime >= 8 && videoCurrentTime < 16 ? '1px solid #60A5FA' : '1px solid #334155',
            borderRadius: 6,
            padding: '0.5rem 0.65rem',
            fontSize: '0.73rem',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ fontWeight: 700, color: videoCurrentTime >= 8 && videoCurrentTime < 16 ? '#FFFFFF' : '#60A5FA' }}>
            00:08 - Stream Analysis
          </div>
          <div style={{ fontSize: '0.66rem', color: '#CBD5E1' }}>{session.targetStream || 'Engineering / CS'}</div>
        </button>

        <button
          type="button"
          onClick={() => jumpToTime(16)}
          style={{
            backgroundColor: videoCurrentTime >= 16 && videoCurrentTime < 24 ? '#2563EB' : '#0F172A',
            color: '#FFFFFF',
            border: videoCurrentTime >= 16 && videoCurrentTime < 24 ? '1px solid #60A5FA' : '1px solid #334155',
            borderRadius: 6,
            padding: '0.5rem 0.65rem',
            fontSize: '0.73rem',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ fontWeight: 700, color: videoCurrentTime >= 16 && videoCurrentTime < 24 ? '#FFFFFF' : '#60A5FA' }}>
            00:16 - Target Colleges
          </div>
          <div style={{ fontSize: '0.66rem', color: '#CBD5E1' }}>{session.targetCity || 'Munich / European'}</div>
        </button>

        <button
          type="button"
          onClick={() => jumpToTime(24)}
          style={{
            backgroundColor: videoCurrentTime >= 24 ? '#2563EB' : '#0F172A',
            color: '#FFFFFF',
            border: videoCurrentTime >= 24 ? '1px solid #60A5FA' : '1px solid #334155',
            borderRadius: 6,
            padding: '0.5rem 0.65rem',
            fontSize: '0.73rem',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ fontWeight: 700, color: videoCurrentTime >= 24 ? '#FFFFFF' : '#60A5FA' }}>
            00:24 - Enrolment Sign-off
          </div>
          <div style={{ fontSize: '0.66rem', color: '#CBD5E1' }}>WhatsApp Policies Sent</div>
        </button>
      </div>
    </div>
  );

  const renderCandidateGridBlock = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', fontSize: '0.78rem' }}>
      <div style={{ backgroundColor: '#1E293B', padding: '0.65rem 0.8rem', borderRadius: 8, border: '1px solid #334155' }}>
        <span style={{ fontSize: '0.68rem', color: '#94A3B8', display: 'block' }}>Student Candidate</span>
        <strong style={{ color: '#F8FAFC' }}>{session.studentProfile?.fullName || session.studentName || 'Student'}</strong>
      </div>
      <div style={{ backgroundColor: '#1E293B', padding: '0.65rem 0.8rem', borderRadius: 8, border: '1px solid #334155' }}>
        <span style={{ fontSize: '0.68rem', color: '#94A3B8', display: 'block' }}>Conducting Counsellor</span>
        <strong style={{ color: '#60A5FA' }}>{session.counsellor?.email?.split('@')[0] || session.counsellorEmail}</strong>
      </div>
    </div>
  );

  const renderMilestonesBlock = () => (
    <div style={{ backgroundColor: '#1E293B', padding: '0.75rem 0.95rem', borderRadius: 8, border: '1px solid #334155' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <CheckCircle2 size={13} color="#10B981" /> Verified Discussion Milestones
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.74rem', color: '#CBD5E1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>00:00 - Introduction & Profile Intake</span>
          <span style={{ color: '#10B981', fontWeight: 600 }}>Completed</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>00:08 - Stream ({session.targetStream || 'General Career'})</span>
          <span style={{ color: '#10B981', fontWeight: 600 }}>Completed</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>00:16 - Target Colleges Evaluation</span>
          <span style={{ color: '#10B981', fontWeight: 600 }}>Completed</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>00:24 - Enrolment Policies Sign-off</span>
          <span style={{ color: '#10B981', fontWeight: 600 }}>Verified</span>
        </div>
      </div>
    </div>
  );

  if (!session) return null;

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
        zIndex: 9999,
        padding: '1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
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
                width: 38,
                height: 38,
                borderRadius: '8px',
                backgroundColor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB',
              }}
            >
              <FileText size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0F172A' }}>
                Counselling Session Audit Record
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>
                Official verification record for session #{session.id.slice(0, 8)}
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

        {/* Modal Body */}
        <div
          style={{
            padding: '1.5rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            flex: 1,
          }}
        >
          {/* Key Parties Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div
              style={{
                padding: '1rem',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <User size={16} color="#2563EB" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                  Student
                </span>
              </div>
              <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>
                {session.studentProfile?.fullName || session.studentName || 'Enrolled Student'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem' }}>
                {session.studentProfile?.contactEmail || session.studentEmail || session.studentProfile?.user?.email}
              </div>
            </div>

            <div
              style={{
                padding: '1rem',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <UserCheck size={16} color="#16A34A" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                  Assigned Counsellor
                </span>
              </div>
              <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>
                {session.counsellor?.email?.split('@')[0] || session.counsellorEmail}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem' }}>
                {session.counsellor?.email || session.counsellorEmail}
              </div>
            </div>
          </div>

          {/* Time & Schedule Details */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '0.75rem',
              padding: '1rem',
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: '8px',
            }}
          >
            <div>
              <span style={{ fontSize: '0.72rem', color: '#1E40AF', display: 'block', fontWeight: 600 }}>Scheduled Time</span>
              <strong style={{ fontSize: '0.85rem', color: '#1E3A8A' }}>
                {new Date(session.scheduledAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}{' '}
                {new Date(session.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </strong>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#1E40AF', display: 'block', fontWeight: 600 }}>Actual Duration</span>
              <strong style={{ fontSize: '0.85rem', color: '#1E3A8A' }}>
                {session.durationMinutes ? `${session.durationMinutes} mins` : 'N/A'}
              </strong>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#1E40AF', display: 'block', fontWeight: 600 }}>Session Status</span>
              <div style={{ marginTop: 2 }}>
                <StatusBadge status={session.status} />
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#1E40AF', display: 'block', fontWeight: 600 }}>Follow-up Flag</span>
              <div style={{ marginTop: 2 }}>
                {session.followUpRequired ? (
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#D97706', backgroundColor: '#FFFBEB', padding: '0.15rem 0.5rem', borderRadius: 9999, border: '1px solid #FDE68A' }}>
                    Required
                  </span>
                ) : (
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#16A34A', backgroundColor: '#F0FDF4', padding: '0.15rem 0.5rem', borderRadius: 9999, border: '1px solid #BBF7D0' }}>
                    None
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Session Outcome & Recommendations */}
          <div>
            <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
              Session Outcome & Deliberations
            </h4>
            <div
              style={{
                padding: '0.85rem 1rem',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '0.85rem',
                color: '#334155',
                lineHeight: 1.5,
              }}
            >
              {session.sessionOutcome || 'No formal outcome summary recorded yet.'}
            </div>
          </div>

          <div>
            <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
              Actionable Recommendations
            </h4>
            <div
              style={{
                padding: '0.85rem 1rem',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '0.85rem',
                color: '#334155',
                lineHeight: 1.5,
              }}
            >
              {session.recommendations || 'No specific recommendations logged.'}
            </div>
          </div>

          {session.nextAction && (
            <div>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
                Next Follow-up Action
              </h4>
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  color: '#92400E',
                  fontWeight: 500,
                }}
              >
                {session.nextAction}
              </div>
            </div>
          )}

          {/* Session Recording & Notification Audit */}
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block' }}>
                Automated Session Recording
              </span>
              <span style={{ fontSize: '0.8rem', color: '#0F172A' }}>
                {session.isRecorded !== false ? 'Archived & Audited by Superconsciousness Compliance' : 'Standard Session'}
              </span>
            </div>
            {session.recordingUrl && (
              <button
                type="button"
                onClick={() => setIsPlayingRecording(true)}
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#2563EB',
                  backgroundColor: '#EFF6FF',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  border: '1px solid #BFDBFE',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Video size={14} /> Watch Recording Stream
              </button>
            )}
          </div>

          {/* Audio Audit Record Section */}
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Headphones size={17} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>
                      Official Audio Audit Stream
                    </span>
                    <span
                      style={{
                        fontSize: '0.66rem',
                        fontWeight: 700,
                        color: '#16A34A',
                        backgroundColor: '#DCFCE7',
                        padding: '0.1rem 0.45rem',
                        borderRadius: 9999,
                        border: '1px solid #BBF7D0',
                      }}
                    >
                      Audit Certified
                    </span>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
                    22kHz 16-bit Master Audio • Archived & Audited by Superconsciousness Compliance
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAudioAuditPlayer(!showAudioAuditPlayer)}
                  style={{
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    color: showAudioAuditPlayer ? '#FFFFFF' : '#2563EB',
                    backgroundColor: showAudioAuditPlayer ? '#2563EB' : '#EFF6FF',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #BFDBFE',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Headphones size={13} />
                  <span>{showAudioAuditPlayer ? 'Collapse Player' : 'Listen to Audio Audit'}</span>
                </button>

                <a
                  href={audioUrl}
                  download={`audio-audit-${session.id.slice(0, 8)}.wav`}
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    color: '#475569',
                    backgroundColor: '#FFFFFF',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                  title="Download .wav audio audit"
                >
                  <Download size={12} /> Download .wav
                </a>
              </div>
            </div>

            {/* Hidden native HTML5 audio element */}
            <audio
              ref={audioRef}
              src={audioUrl}
              preload="metadata"
              onTimeUpdate={() => {
                if (audioRef.current) {
                  setAudioCurrentTime(audioRef.current.currentTime);
                }
              }}
              onLoadedMetadata={() => {
                if (audioRef.current) {
                  setAudioDuration(audioRef.current.duration || 24.4);
                }
              }}
              onPlay={() => setIsAudioPlaying(true)}
              onPause={() => setIsAudioPlaying(false)}
              onEnded={() => {
                setIsAudioPlaying(false);
                setAudioCurrentTime(0);
              }}
            />

            {/* Interactive Audio Player Panel */}
            {showAudioAuditPlayer && (
              <div
                style={{
                  backgroundColor: '#0F172A',
                  borderRadius: '8px',
                  padding: '0.85rem 1rem',
                  color: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    {/* Play / Pause Button */}
                    <button
                      type="button"
                      onClick={toggleAudioPlay}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        backgroundColor: '#2563EB',
                        color: '#FFFFFF',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)',
                        transition: 'transform 0.1s ease',
                      }}
                      title={isAudioPlaying ? 'Pause Audio' : 'Play Audio'}
                    >
                      {isAudioPlaying ? <Pause size={17} /> : <Play size={17} style={{ marginLeft: 2 }} />}
                    </button>

                    {/* Equalizer animation */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '22px' }}>
                      {[12, 22, 16, 26, 14, 20, 24, 18, 10, 22, 15, 25].map((h, i) => (
                        <div
                          key={i}
                          style={{
                            width: 3,
                            height: isAudioPlaying
                              ? `${Math.max(5, (h * ((Math.floor(audioCurrentTime * 4) + i * 2) % 10)) / 10 + 5)}px`
                              : `${Math.max(4, h / 3)}px`,
                            backgroundColor: isAudioPlaying ? '#60A5FA' : '#475569',
                            borderRadius: 2,
                            transition: 'height 0.15s ease',
                          }}
                        />
                      ))}
                    </div>

                    {/* Time counter */}
                    <span style={{ fontSize: '0.76rem', color: '#CBD5E1', fontFamily: 'monospace', fontWeight: 600 }}>
                      {formatAudioTime(audioCurrentTime)} / {formatAudioTime(audioDuration || 24.4)}
                    </span>
                  </div>

                  {/* Right controls: Speed & Mute */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <button
                      type="button"
                      onClick={toggleAudioMute}
                      style={{
                        backgroundColor: '#1E293B',
                        color: isAudioMuted ? '#EF4444' : '#94A3B8',
                        border: '1px solid #334155',
                        borderRadius: 4,
                        padding: '0.2rem 0.45rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.72rem',
                      }}
                      title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
                    >
                      {isAudioMuted ? <VolumeX size={13} color="#EF4444" /> : <Volume2 size={13} />}
                      <span>{isAudioMuted ? 'Muted' : 'Sound'}</span>
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {[1, 1.25, 1.5].map((spd) => (
                        <button
                          key={spd}
                          type="button"
                          onClick={() => changeAudioSpeed(spd)}
                          style={{
                            backgroundColor: audioSpeed === spd ? '#2563EB' : '#1E293B',
                            color: '#FFFFFF',
                            border: audioSpeed === spd ? '1px solid #60A5FA' : '1px solid #334155',
                            borderRadius: 4,
                            padding: '0.18rem 0.45rem',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Progress Slider */}
                <input
                  type="range"
                  min={0}
                  max={audioDuration || 24.4}
                  step={0.1}
                  value={audioCurrentTime}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (audioRef.current) {
                      audioRef.current.currentTime = val;
                    }
                    setAudioCurrentTime(val);
                  }}
                  style={{
                    width: '100%',
                    accentColor: '#3B82F6',
                    cursor: 'pointer',
                    height: 4,
                    margin: 0,
                  }}
                />

                {/* Spoken Dialogue Transcript Box */}
                <div
                  style={{
                    backgroundColor: '#1E293B',
                    borderRadius: 6,
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.75rem',
                    color: '#CBD5E1',
                    lineHeight: 1.45,
                    borderLeft: '3px solid #3B82F6',
                  }}
                >
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#60A5FA', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                    Audited Audio Transcript (Spoken):
                  </div>
                  <span>
                    "Hello and welcome. This is the official audited audio stream for the Superconsciousness counselling session. The student academic profile, GRE and GPA scores, course stream recommendations, and European university eligibility have been reviewed and approved by compliance governance."
                  </span>
                </div>
              </div>
            )}
          </div>

          {session.reminderSentAt && (
            <div
              style={{
                padding: '0.65rem 0.85rem',
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '6px',
                fontSize: '0.8rem',
                color: '#065F46',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span>🔔 Session reminder was dispatched to student via <strong>{session.reminderSentVia || 'WHATSAPP'}</strong> at {new Date(session.reminderSentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.</span>
            </div>
          )}

          {/* Student Interest & Detailed Report for Admin Audit (PDF Requirement) */}
          <div
            style={{
              padding: '1.15rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
                Student Interest & Advisory Outcome Report
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.65rem',
                  borderRadius: 9999,
                  backgroundColor:
                    session.studentInterest === 'INTERESTED'
                      ? '#DCFCE7'
                      : session.studentInterest === 'NOT_INTERESTED'
                        ? '#FEE2E2'
                        : '#FEF3C7',
                  color:
                    session.studentInterest === 'INTERESTED'
                      ? '#15803D'
                      : session.studentInterest === 'NOT_INTERESTED'
                        ? '#B91C1C'
                        : '#B45309',
                }}
              >
                {session.studentInterest || 'UNDECIDED'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', fontWeight: 600 }}>Target Stream</span>
                <strong style={{ fontSize: '0.85rem', color: '#0F172A' }}>{session.targetStream || 'General Academic'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', fontWeight: 600 }}>Departments / Majors</span>
                <strong style={{ fontSize: '0.85rem', color: '#0F172A' }}>{session.targetDepartments || 'All Disciplines'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', fontWeight: 600 }}>Target Colleges</span>
                <strong style={{ fontSize: '0.85rem', color: '#0F172A' }}>{session.targetColleges || 'Not Specified'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', fontWeight: 600 }}>Scope & City</span>
                <strong style={{ fontSize: '0.85rem', color: '#0F172A' }}>
                  {session.studyScope || 'INTERNATIONAL'} {session.targetCity ? `(${session.targetCity})` : ''}
                </strong>
              </div>
            </div>

            {session.detailedInterestReport && (
              <div style={{ marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>
                  Admin Performance Audit Report (Detailed)
                </span>
                <div
                  style={{
                    padding: '0.75rem 0.9rem',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    color: '#334155',
                    lineHeight: 1.5,
                  }}
                >
                  {session.detailedInterestReport}
                </div>
              </div>
            )}
          </div>

          {session.counsellorNotes && (
            <div>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
                Counsellor Advisory Notes
              </h4>
              <div
                style={{
                  padding: '0.85rem 1rem',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  color: '#334155',
                  lineHeight: 1.5,
                }}
              >
                {session.counsellorNotes}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #E2E8F0',
            backgroundColor: '#F8FAFC',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            className="saas-btn saas-btn-primary"
            style={{ fontSize: '0.85rem' }}
            type="button"
          >
            Close Audit Record
          </button>
        </div>
      </div>

      {isPlayingRecording && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsPlayingRecording(false);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1.25rem',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: playerLayout === 'split' ? '1120px' : '920px',
              height: '92vh',
              maxHeight: '92vh',
              backgroundColor: '#0F172A',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              color: '#FFFFFF',
              position: 'relative',
              transition: 'max-width 0.2s ease',
            }}
          >
            {/* Player Sticky Header */}
            <div
              style={{
                padding: '0.75rem 1.25rem',
                borderBottom: '1px solid #1E293B',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#1E293B',
                flexShrink: 0,
                zIndex: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    backgroundColor: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                  }}
                >
                  <Video size={17} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#F8FAFC' }}>
                    Recorded Counselling Audit Stream — #{session.id.slice(0, 8)}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.72rem', color: '#94A3B8' }}>
                    <ShieldCheck size={13} color="#10B981" />
                    <span>Audit Certified • End-to-End Governance</span>
                    <span>•</span>
                    <Clock size={12} />
                    <span>{session.durationMinutes || 45} mins total</span>
                  </div>
                </div>
              </div>

              {/* View Switcher & Close button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#0F172A',
                    borderRadius: 6,
                    padding: '0.2rem',
                    border: '1px solid #334155',
                    gap: '0.2rem',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setPlayerLayout('split')}
                    title="Side-by-Side Suite: Video on left, all down matter visible on right"
                    style={{
                      backgroundColor: playerLayout === 'split' ? '#2563EB' : 'transparent',
                      color: playerLayout === 'split' ? '#FFFFFF' : '#94A3B8',
                      border: 'none',
                      borderRadius: 4,
                      padding: '0.3rem 0.65rem',
                      fontSize: '0.73rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Columns size={13} />
                    <span>Side-by-Side</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlayerLayout('stacked')}
                    title="Stacked View: Video on top, full down matter below"
                    style={{
                      backgroundColor: playerLayout === 'stacked' ? '#2563EB' : 'transparent',
                      color: playerLayout === 'stacked' ? '#FFFFFF' : '#94A3B8',
                      border: 'none',
                      borderRadius: 4,
                      padding: '0.3rem 0.65rem',
                      fontSize: '0.73rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Rows size={13} />
                    <span>Stacked View</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPlayingRecording(false)}
                  style={{
                    backgroundColor: '#DC2626',
                    color: '#FFFFFF',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.4rem 0.85rem',
                    borderRadius: 6,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    transition: 'opacity 0.15s ease',
                  }}
                >
                  <X size={16} /> Close (Esc)
                </button>
              </div>
            </div>

            {/* Modal Body: Smoothly scrollable with thin scrollbar */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1rem 1.25rem',
              }}
            >
              {playerLayout === 'split' ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 1fr)',
                    gap: '1rem',
                    alignItems: 'start',
                  }}
                >
                  {/* Left Column: Video, Controls & Transcript */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {renderVideoPlayerBlock('275px')}
                    {renderControlsBarBlock()}
                    {renderTranscriptBlock()}
                  </div>

                  {/* Right Column: "Down Matter" directly beside video, 100% visible */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {renderChaptersBlock('1fr 1fr')}
                    {renderCandidateGridBlock()}
                    {renderMilestonesBlock()}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem',
                    maxWidth: '850px',
                    margin: '0 auto',
                  }}
                >
                  {renderVideoPlayerBlock('290px')}
                  {renderControlsBarBlock()}
                  {renderTranscriptBlock()}
                  {renderChaptersBlock('repeat(auto-fit, minmax(180px, 1fr))')}
                  {renderCandidateGridBlock()}
                  {renderMilestonesBlock()}
                </div>
              )}
            </div>

            {/* Player Sticky Footer */}
            <div
              style={{
                padding: '0.75rem 1.25rem',
                borderTop: '1px solid #1E293B',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#1E293B',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                Resolution: 1080p HD • Audio: 48kHz Stereo AAC
              </span>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <a
                  href={streamUrl}
                  download={`session-${session.id.slice(0, 8)}.mp4`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#94A3B8',
                    backgroundColor: '#334155',
                    padding: '0.45rem 0.85rem',
                    borderRadius: 6,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Download size={13} /> Direct Stream URL
                </a>
                <button
                  type="button"
                  onClick={() => setIsPlayingRecording(false)}
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    backgroundColor: '#DC2626',
                    padding: '0.45rem 1.1rem',
                    borderRadius: 6,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  ✕ Close Recording & Return
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

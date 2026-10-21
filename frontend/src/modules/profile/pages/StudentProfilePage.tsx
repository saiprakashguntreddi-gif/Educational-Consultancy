import React, { useState, useEffect } from 'react';
import { ProfileService } from '../services/profile.service';
import { StudentProfileRecord, StudentProfileIntakeInput } from '../profile.types';
import { ProfileIntakeForm } from '../components/ProfileIntakeForm';
import { ShieldCheck, Clock, XCircle, Edit3, CheckCircle, GraduationCap, Compass, ArrowRight } from 'lucide-react';

interface StudentProfilePageProps {
  onNavigateToPreferences?: () => void;
}

export const StudentProfilePage: React.FC<StudentProfilePageProps> = ({ onNavigateToPreferences }) => {
  const [profile, setProfile] = useState<StudentProfileRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await ProfileService.getMyProfile();
      if (response.success && response.data) {
        setProfile(response.data);
      }
    } catch {
      // 404 means student hasn't submitted their intake yet, which is normal for a new account
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleIntakeSubmit = async (data: StudentProfileIntakeInput) => {
    return await ProfileService.submitIntake(data);
  };

  const handleSuccess = (record: StudentProfileRecord) => {
    setProfile(record);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Loading Student Record...</div>
        <p style={{ fontSize: '0.875rem' }}>Accessing Module 1 database repository...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '960px', margin: '2.5rem auto', padding: '0 1.5rem' }}>
      {/* Module 1 Header Banner */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary-light)', color: '#818cf8', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            <GraduationCap size={16} /> Module 1: Account & Profile Intake
          </div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>
            {profile ? profile.fullName : 'Student Profile Intake'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
            Official student record foundation for educational consultancy, guidance, and verification.
          </p>
        </div>

        {profile && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              {profile.verificationStatus === 'VERIFIED' && (
                <span className="badge badge-verified">
                  <ShieldCheck size={14} /> Verified Student Record
                </span>
              )}
              {profile.verificationStatus === 'PENDING' && (
                <span className="badge badge-pending">
                  <Clock size={14} /> Verification In Review
                </span>
              )}
              {profile.verificationStatus === 'REJECTED' && (
                <span className="badge badge-rejected">
                  <XCircle size={14} /> Verification Action Required
                </span>
              )}
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '0.45rem 0.9rem' }}
            >
              <Edit3 size={15} />
              {isEditing ? 'Cancel Edit' : 'Edit Profile Intake'}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div style={{ background: 'var(--status-rejected-bg)', border: '1px solid var(--status-rejected-border)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', color: 'var(--status-rejected-text)' }}>
          {error}
        </div>
      )}

      {/* Content Area: Form or Verified Record View */}
      {(!profile || isEditing) ? (
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '0.3rem' }}>
              {profile ? 'Update Profile Record' : 'Initial Student Profile Registration'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Please provide all 9 required intake fields accurately. This data forms the verified foundation for future counselling and academic guidance.
            </p>
          </div>

          <ProfileIntakeForm
            initialData={profile}
            onSubmit={handleIntakeSubmit}
            onSubmitSuccess={handleSuccess}
          />
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          {/* Verification Status Details */}
          {profile.verificationStatus === 'VERIFIED' && (
            <div style={{
              background: 'var(--status-verified-bg)',
              border: '1px solid var(--status-verified-border)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
            }}>
              <CheckCircle size={24} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ color: '#34d399', fontSize: '1rem', marginBottom: '0.25rem' }}>
                  Student Record Verified & Locked
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  This profile has been verified by the educational consultancy team on {new Date(profile.verifiedAt || '').toLocaleDateString()}.
                  {profile.verificationNotes && ` Note: ${profile.verificationNotes}`}
                </p>
              </div>
            </div>
          )}

          {profile.verificationStatus === 'PENDING' && (
            <div style={{
              background: 'var(--status-pending-bg)',
              border: '1px solid var(--status-pending-border)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
            }}>
              <Clock size={24} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ color: '#fbbf24', fontSize: '1rem', marginBottom: '0.25rem' }}>
                  Awaiting Counsellor Verification
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  Your profile intake has been recorded in the platform database. A certified counsellor or administrator will review and verify your record. Verified student guidance actions remain restricted until authentication is complete.
                </p>
              </div>
            </div>
          )}

          {profile.verificationStatus === 'REJECTED' && (
            <div style={{
              background: 'var(--status-rejected-bg)',
              border: '1px solid var(--status-rejected-border)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
            }}>
              <XCircle size={24} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ color: '#f87171', fontSize: '1rem', marginBottom: '0.25rem' }}>
                  Verification Action Required
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  A counsellor reviewed your profile intake and requested corrections.
                  {profile.verificationNotes && (
                    <span style={{ display: 'block', marginTop: '0.5rem', color: '#fca5a5', fontWeight: 600 }}>
                      Counsellor Feedback: "{profile.verificationNotes}"
                    </span>
                  )}
                  Please click "Edit Profile Intake" above to update your information and re-submit for review.
                </p>
              </div>
            </div>
          )}

          {/* Profile Overview Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
            {/* Identity & Personal */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>
                Personal Details
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
                <div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>FULL NAME</div>
                  <div style={{ fontWeight: 600 }}>{profile.fullName}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>GENDER</div>
                  <div style={{ fontWeight: 600 }}>{profile.gender}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>CITIZENSHIP</div>
                  <div style={{ fontWeight: 600 }}>{profile.citizenship}</div>
                </div>
              </div>
            </div>

            {/* Academic Curriculum */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>
                Academic Curriculum
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
                <div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>CLASS / GRADE</div>
                  <div style={{ fontWeight: 600 }}>{profile.grade}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>BOARD / CURRICULUM</div>
                  <div style={{ fontWeight: 600 }}>{profile.board}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>PASSING-OUT YEAR</div>
                  <div style={{ fontWeight: 600 }}>{profile.passingOutYear}</div>
                </div>
              </div>
            </div>

            {/* Contact & Verified Address */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-violet)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>
                Contact & Address
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
                <div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>CONTACT EMAIL</div>
                  <div style={{ fontWeight: 600 }}>{profile.contactEmail}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>PHONE</div>
                  <div style={{ fontWeight: 600 }}>{profile.phone}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>ADDRESS</div>
                  <div style={{ fontWeight: 500, color: 'var(--text-muted)' }}>
                    {profile.address.street}, {profile.address.city}, {profile.address.state} - {profile.address.postalCode}, {profile.address.country}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Module 2 Callout Banner */}
          {onNavigateToPreferences && (
            <div
              style={{
                marginTop: '2rem',
                padding: '1.5rem 2rem',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#a5b4fc', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                  <Compass size={16} /> Next Stage: Module 2 — Preferences
                </div>
                <div style={{ color: '#f8fafc', fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.2rem' }}>
                  Define Your Priority Study Destinations and Academic Specializations
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  Select priority countries, department, and sub-department to guide educational matching.
                </div>
              </div>
              <button
                onClick={onNavigateToPreferences}
                className="btn btn-primary"
                style={{ padding: '0.7rem 1.4rem', fontSize: '0.9rem' }}
              >
                Proceed to Preferences <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

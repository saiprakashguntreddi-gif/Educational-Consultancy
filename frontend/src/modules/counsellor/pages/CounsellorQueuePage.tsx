import React, { useState, useEffect } from 'react';
import { ProfileService } from '../../profile/services/profile.service';
import { StudentProfileRecord, VerificationStatus } from '../../profile/profile.types';
import { ShieldCheck, Check, X, Clock, Compass, GraduationCap, Sparkles } from 'lucide-react';
import { PreferencesService } from '../../preferences/services/preferences.service';
import { StudentPreferenceRecord } from '../../preferences/preferences.types';
import { EducationService } from '../../education/services/education.service';
import { StudentEducationRecord } from '../../education/education.types';
import { CounsellorRecommendationModal } from '../../recommendations/components/CounsellorRecommendationModal';

export const CounsellorQueuePage: React.FC = () => {
  const [profiles, setProfiles] = useState<StudentProfileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<StudentProfileRecord | null>(null);
  const [selectedPreferences, setSelectedPreferences] = useState<StudentPreferenceRecord | null>(null);
  const [isLoadingPrefs, setIsLoadingPrefs] = useState(false);
  const [selectedEducation, setSelectedEducation] = useState<StudentEducationRecord | null>(null);
  const [isLoadingEdu, setIsLoadingEdu] = useState(false);
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [recommendationModalOpen, setRecommendationModalOpen] = useState(false);

  const loadQueue = async () => {
    setIsLoading(true);
    try {
      const response = await ProfileService.listProfiles({ limit: 50 });
      if (response.success && response.data) {
        setProfiles(response.data.profiles);
      }
    } catch {
      setProfiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  useEffect(() => {
    if (selectedProfile) {
      // 1. Fetch Preferences
      setIsLoadingPrefs(true);
      PreferencesService.getPreferencesByProfileId(selectedProfile.id)
        .then((res) => {
          setSelectedPreferences(res.data || null);
        })
        .catch(() => setSelectedPreferences(null))
        .finally(() => setIsLoadingPrefs(false));

      // 2. Fetch Education Details
      setIsLoadingEdu(true);
      EducationService.getEducationByProfileId(selectedProfile.id)
        .then((res) => {
          setSelectedEducation(res.data || null);
        })
        .catch(() => setSelectedEducation(null))
        .finally(() => setIsLoadingEdu(false));
    } else {
      setSelectedPreferences(null);
      setSelectedEducation(null);
    }
  }, [selectedProfile]);

  const handleVerify = async (profileId: string, status: VerificationStatus) => {
    setIsProcessing(true);
    setMessage(null);
    try {
      const res = await ProfileService.verifyProfile(profileId, status, notes);
      if (res.success && res.data) {
        setMessage(`Student record status updated to ${status}`);
        setNotes('');
        setSelectedProfile(null);
        await loadQueue();
      }
    } catch (err: any) {
      setMessage(`Action failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '2.5rem auto', padding: '0 1.5rem' }}>
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          <ShieldCheck size={16} /> Counsellor & Admin Gateway
        </div>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>Student Profile Verification Queue</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
          Review submitted Module 1 intakes and authenticate verified student records for guidance and advisory.
        </p>
      </div>

      {message && (
        <div style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', color: '#c7d2fe' }}>
          {message}
        </div>
      )}

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading verification queue from database...
        </div>
      ) : profiles.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center' }}>
          <Clock size={40} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Verification Queue Is Empty</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto' }}>
            No student profile intakes are currently awaiting review. Register a student account to test the intake and verification lifecycle.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selectedProfile ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
          {/* Table of Profiles */}
          <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>STUDENT NAME</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>GRADE & BOARD</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>STATUS</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      cursor: 'pointer',
                      background: selectedProfile?.id === p.id ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                    }}
                    onClick={() => setSelectedProfile(p)}
                  >
                    <td style={{ padding: '0.9rem 0.5rem', fontWeight: 600 }}>{p.fullName}</td>
                    <td style={{ padding: '0.9rem 0.5rem', color: 'var(--text-muted)' }}>{p.grade} • {p.board}</td>
                    <td style={{ padding: '0.9rem 0.5rem' }}>
                      <span className={`badge badge-${p.verificationStatus.toLowerCase()}`}>
                        {p.verificationStatus}
                      </span>
                    </td>
                    <td style={{ padding: '0.9rem 0.5rem', textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProfile(p);
                        }}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Inspection Panel */}
          {selectedProfile && (
            <div className="glass-panel" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.2rem' }}>Record Verification</h3>
                <button
                  onClick={() => setSelectedProfile(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                <div><strong style={{ color: 'var(--text-dim)' }}>Name:</strong> {selectedProfile.fullName}</div>
                <div><strong style={{ color: 'var(--text-dim)' }}>Gender:</strong> {selectedProfile.gender}</div>
                <div><strong style={{ color: 'var(--text-dim)' }}>Citizenship:</strong> {selectedProfile.citizenship}</div>
                <div><strong style={{ color: 'var(--text-dim)' }}>Class / Grade:</strong> {selectedProfile.grade}</div>
                <div><strong style={{ color: 'var(--text-dim)' }}>Curriculum:</strong> {selectedProfile.board}</div>
                <div><strong style={{ color: 'var(--text-dim)' }}>Passing-out:</strong> {selectedProfile.passingOutYear}</div>
                <div><strong style={{ color: 'var(--text-dim)' }}>Email:</strong> {selectedProfile.contactEmail}</div>
                <div><strong style={{ color: 'var(--text-dim)' }}>Phone:</strong> {selectedProfile.phone}</div>
                <div>
                  <strong style={{ color: 'var(--text-dim)' }}>Address:</strong> {selectedProfile.address.street}, {selectedProfile.address.city}, {selectedProfile.address.state} - {selectedProfile.address.postalCode}, {selectedProfile.address.country}
                </div>
              </div>

              {/* Module 2: Preferences Review */}
              <div
                style={{
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: '#818cf8',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    marginBottom: '0.6rem',
                  }}
                >
                  <Compass size={14} /> Module 2: Preferences
                </div>
                {isLoadingPrefs ? (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    Loading student preferences...
                  </div>
                ) : selectedPreferences ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.825rem' }}>
                    <div>
                      <strong style={{ color: 'var(--text-dim)' }}>Primary Destination:</strong>{' '}
                      <span style={{ color: '#fbbf24', fontWeight: 600 }}>
                        {selectedPreferences.countriesNotFinalized
                          ? 'Not finalized'
                          : selectedPreferences.primaryCountry || 'None designated'}
                      </span>
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-dim)' }}>Target Destinations:</strong>{' '}
                      {selectedPreferences.countriesNotFinalized
                        ? "I haven't finalized countries where I want to study"
                        : selectedPreferences.countries.join(', ')}
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-dim)' }}>Department:</strong>{' '}
                      {selectedPreferences.coursesNotFinalized
                        ? 'Not finalized'
                        : selectedPreferences.department}
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-dim)' }}>Specialization:</strong>{' '}
                      <span style={{ color: '#a5b4fc', fontWeight: 500 }}>
                        {selectedPreferences.coursesNotFinalized
                          ? "I haven't finalized which courses I want to study"
                          : selectedPreferences.subDepartment}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                    No Module 2 preferences recorded for this student yet.
                  </div>
                )}
              </div>

              {/* Module 3: Education Details Review */}
              <div
                style={{
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: '#34d399',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    marginBottom: '0.6rem',
                  }}
                >
                  <GraduationCap size={14} /> Module 3: Education Details
                </div>
                {isLoadingEdu ? (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    Loading student education records...
                  </div>
                ) : selectedEducation ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.825rem' }}>
                    <div>
                      <strong style={{ color: 'var(--text-dim)' }}>12th Institution:</strong>{' '}
                      <span style={{ color: '#e2e8f0', fontWeight: 600 }}>
                        {selectedEducation.schoolName}
                      </span>{' '}
                      ({selectedEducation.board}, {selectedEducation.completionYear})
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-dim)' }}>12th Aggregate:</strong>{' '}
                      <span style={{ color: '#38bdf8', fontWeight: 700 }}>
                        {selectedEducation.percentage}%
                      </span>
                    </div>
                    {selectedEducation.subjectDetails && selectedEducation.subjectDetails.length > 0 && (
                      <div>
                        <strong style={{ color: 'var(--text-dim)' }}>Subjects & Scores:</strong>{' '}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                          {selectedEducation.subjectDetails.map((sub, idx) => (
                            <span
                              key={idx}
                              style={{
                                background: 'rgba(255, 255, 255, 0.08)',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                              }}
                            >
                              {sub.subject}: <strong style={{ color: '#6ee7b7' }}>{sub.score}%</strong>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedEducation.tenthSchoolName && (
                      <div style={{ marginTop: '0.35rem', paddingTop: '0.35rem', borderTop: '1px dashed rgba(255,255,255,0.08)' }}>
                        <strong style={{ color: 'var(--text-dim)' }}>10th Standard:</strong>{' '}
                        {selectedEducation.tenthSchoolName} ({selectedEducation.tenthBoard || 'CBSE'}
                        {selectedEducation.tenthPercentage ? `, ${selectedEducation.tenthPercentage}%` : ''})
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                    No Module 3 education details recorded for this student yet.
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Verification Notes / Justification</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Optional verification note or reason for rejection"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => handleVerify(selectedProfile.id, 'VERIFIED')}
                  disabled={isProcessing}
                  className="btn btn-primary"
                  style={{ flex: 1, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                >
                  <Check size={16} /> Authenticate Record
                </button>
                <button
                  onClick={() => handleVerify(selectedProfile.id, 'REJECTED')}
                  disabled={isProcessing}
                  className="btn btn-secondary"
                  style={{ flex: 1, color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                >
                  <X size={16} /> Reject
                </button>
              </div>

              {selectedProfile.verificationStatus === 'VERIFIED' && (
                <button
                  type="button"
                  onClick={() => setRecommendationModalOpen(true)}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    marginTop: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    background: 'rgba(168, 85, 247, 0.12)',
                    borderColor: 'rgba(168, 85, 247, 0.35)',
                    color: '#c084fc',
                    fontWeight: 600,
                  }}
                >
                  <Sparkles size={16} /> Review Three-Tier Recommendations
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {selectedProfile && (
        <CounsellorRecommendationModal
          isOpen={recommendationModalOpen}
          onClose={() => setRecommendationModalOpen(false)}
          studentProfileId={selectedProfile.id}
          studentName={selectedProfile.fullName}
        />
      )}
    </div>
  );
};

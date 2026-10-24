import React, { useState, useEffect } from 'react';
import { ProfileService } from '../../profile/services/profile.service';
import { StudentProfileRecord, VerificationStatus } from '../../profile/profile.types';
import { ShieldCheck, Check, X, Clock, Compass, GraduationCap, Sparkles, Award } from 'lucide-react';
import { PreferencesService } from '../../preferences/services/preferences.service';
import { StudentPreferenceRecord } from '../../preferences/preferences.types';
import { EducationService } from '../../education/services/education.service';
import { StudentEducationRecord } from '../../education/education.types';
import { CounsellorRecommendationModal } from '../../recommendations/components/CounsellorRecommendationModal';
import { CounsellorAssessmentModal } from '../../assessments/components/CounsellorAssessmentModal';

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
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);

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
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div className="saas-welcome-banner">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#DCFCE7', color: '#15803D', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            <ShieldCheck size={16} /> Verification Gateway
          </div>
          <h1 className="saas-welcome-title">Student Profile Verification Queue</h1>
          <p className="saas-welcome-sub">
            Review submitted student intakes and authenticate verified student records for guidance and advisory.
          </p>
        </div>
      </div>

      {message && (
        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', color: '#1E40AF', fontSize: '0.9rem' }}>
          {message}
        </div>
      )}

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748B' }}>
          Loading verification queue from database...
        </div>
      ) : profiles.length === 0 ? (
        <div className="saas-card" style={{ padding: '3.5rem', textAlign: 'center' }}>
          <Clock size={40} color="#CBD5E1" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#0F172A' }}>Verification Queue Is Empty</h3>
          <p style={{ color: '#64748B', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto' }}>
            No student profile intakes are currently awaiting review. All registered students have been processed.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selectedProfile ? '1.1fr 0.9fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Table of Profiles */}
          <div className="saas-card" style={{ padding: '1.25rem', overflowX: 'auto', marginBottom: 0 }}>
            <table className="saas-table" style={{ width: '100%', fontSize: '0.875rem' }}>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Grade & Board</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr
                    key={p.id}
                    style={{
                      cursor: 'pointer',
                      background: selectedProfile?.id === p.id ? '#EFF6FF' : 'transparent',
                    }}
                    onClick={() => setSelectedProfile(p)}
                  >
                    <td style={{ fontWeight: 600, color: '#0F172A' }}>{p.fullName}</td>
                    <td style={{ color: '#64748B', fontSize: '0.82rem' }}>{p.grade} • {p.board}</td>
                    <td>
                      <span className={`badge badge-${p.verificationStatus.toLowerCase()}`}>
                        {p.verificationStatus}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="saas-btn saas-btn-secondary saas-btn-sm"
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
            <div className="saas-card" style={{ padding: '1.5rem', marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>Record Verification</h3>
                <button
                  onClick={() => setSelectedProfile(null)}
                  style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Close
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '1.25rem', color: '#334155' }}>
                <div><strong style={{ color: '#0F172A' }}>Name:</strong> {selectedProfile.fullName}</div>
                <div><strong style={{ color: '#0F172A' }}>Gender:</strong> {selectedProfile.gender}</div>
                <div><strong style={{ color: '#0F172A' }}>Citizenship:</strong> {selectedProfile.citizenship}</div>
                <div><strong style={{ color: '#0F172A' }}>Class / Grade:</strong> {selectedProfile.grade}</div>
                <div><strong style={{ color: '#0F172A' }}>Curriculum:</strong> {selectedProfile.board}</div>
                <div><strong style={{ color: '#0F172A' }}>Passing-out:</strong> {selectedProfile.passingOutYear}</div>
                <div><strong style={{ color: '#0F172A' }}>Email:</strong> {selectedProfile.contactEmail}</div>
                <div><strong style={{ color: '#0F172A' }}>Phone:</strong> {selectedProfile.phone}</div>
                <div>
                  <strong style={{ color: '#0F172A' }}>Address:</strong> {selectedProfile.address.street}, {selectedProfile.address.city}, {selectedProfile.address.state} - {selectedProfile.address.postalCode}, {selectedProfile.address.country}
                </div>
              </div>

              {/* Module 2: Preferences Review */}
              <div
                style={{
                  marginBottom: '1rem',
                  padding: '1rem',
                  borderRadius: '8px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: '#2563EB',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    marginBottom: '0.5rem',
                  }}
                >
                  <Compass size={14} /> Module 2: Preferences
                </div>
                {isLoadingPrefs ? (
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                    Loading student preferences...
                  </div>
                ) : selectedPreferences ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem', color: '#334155' }}>
                    <div>
                      <strong style={{ color: '#0F172A' }}>Primary Destination:</strong>{' '}
                      <span style={{ color: '#D97706', fontWeight: 600 }}>
                        {selectedPreferences.countriesNotFinalized
                          ? 'Not finalized'
                          : selectedPreferences.primaryCountry || 'None designated'}
                      </span>
                    </div>
                    <div>
                      <strong style={{ color: '#0F172A' }}>Target Destinations:</strong>{' '}
                      {selectedPreferences.countriesNotFinalized
                        ? "I haven't finalized countries where I want to study"
                        : selectedPreferences.countries.join(', ')}
                    </div>
                    <div>
                      <strong style={{ color: '#0F172A' }}>Department:</strong>{' '}
                      {selectedPreferences.coursesNotFinalized
                        ? 'Not finalized'
                        : selectedPreferences.department}
                    </div>
                    <div>
                      <strong style={{ color: '#0F172A' }}>Specialization:</strong>{' '}
                      <span style={{ color: '#4F46E5', fontWeight: 500 }}>
                        {selectedPreferences.coursesNotFinalized
                          ? "I haven't finalized which courses I want to study"
                          : selectedPreferences.subDepartment}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: '#64748B', fontStyle: 'italic' }}>
                    No Module 2 preferences recorded for this student yet.
                  </div>
                )}
              </div>

              {/* Module 3: Education Details Review */}
              <div
                style={{
                  marginBottom: '1rem',
                  padding: '1rem',
                  borderRadius: '8px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: '#059669',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    marginBottom: '0.5rem',
                  }}
                >
                  <GraduationCap size={14} /> Module 3: Education Details
                </div>
                {isLoadingEdu ? (
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                    Loading student education records...
                  </div>
                ) : selectedEducation ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem', color: '#334155' }}>
                    <div>
                      <strong style={{ color: '#0F172A' }}>12th Institution:</strong>{' '}
                      <span style={{ color: '#0F172A', fontWeight: 600 }}>
                        {selectedEducation.schoolName}
                      </span>{' '}
                      ({selectedEducation.board}, {selectedEducation.completionYear})
                    </div>
                    <div>
                      <strong style={{ color: '#0F172A' }}>12th Aggregate:</strong>{' '}
                      <span style={{ color: '#0284C7', fontWeight: 700 }}>
                        {selectedEducation.percentage}%
                      </span>
                    </div>
                    {selectedEducation.subjectDetails && selectedEducation.subjectDetails.length > 0 && (
                      <div>
                        <strong style={{ color: '#0F172A' }}>Subjects & Scores:</strong>{' '}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                          {selectedEducation.subjectDetails.map((sub, idx) => (
                            <span
                              key={idx}
                              style={{
                                background: '#E2E8F0',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                color: '#1E293B',
                              }}
                            >
                              {sub.subject}: <strong style={{ color: '#059669' }}>{sub.score}%</strong>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedEducation.tenthSchoolName && (
                      <div style={{ marginTop: '0.35rem', paddingTop: '0.35rem', borderTop: '1px dashed #CBD5E1' }}>
                        <strong style={{ color: '#0F172A' }}>10th Standard:</strong>{' '}
                        {selectedEducation.tenthSchoolName} ({selectedEducation.tenthBoard || 'CBSE'}
                        {selectedEducation.tenthPercentage ? `, ${selectedEducation.tenthPercentage}%` : ''})
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: '#64748B', fontStyle: 'italic' }}>
                    No Module 3 education details recorded for this student yet.
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Verification Notes / Justification
                </label>
                <textarea
                  className="saas-input"
                  style={{ width: '100%', height: '70px', padding: '0.6rem 0.8rem', fontSize: '0.85rem' }}
                  placeholder="Optional verification note or reason for rejection"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => handleVerify(selectedProfile.id, 'VERIFIED')}
                  disabled={isProcessing}
                  className="saas-btn saas-btn-primary"
                  style={{ flex: 1, backgroundColor: '#10B981', borderColor: '#10B981' }}
                >
                  <Check size={16} /> Authenticate Record
                </button>
                <button
                  onClick={() => handleVerify(selectedProfile.id, 'REJECTED')}
                  disabled={isProcessing}
                  className="saas-btn saas-btn-danger"
                  style={{ flex: 1 }}
                >
                  <X size={16} /> Reject
                </button>
              </div>

              {selectedProfile.verificationStatus === 'VERIFIED' && (
                <>
                  <button
                    type="button"
                    onClick={() => setRecommendationModalOpen(true)}
                    className="saas-btn saas-btn-secondary"
                    style={{
                      width: '100%',
                      marginTop: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      color: '#7C3AED',
                      borderColor: '#DDD6FE',
                      backgroundColor: '#F5F3FF',
                      fontWeight: 600,
                    }}
                    id="btn-counsellor-recommendations-modal"
                  >
                    <Sparkles size={16} /> Review Three-Tier Recommendations
                  </button>

                  <button
                    type="button"
                    onClick={() => setAssessmentModalOpen(true)}
                    className="saas-btn saas-btn-secondary"
                    style={{
                      width: '100%',
                      marginTop: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      color: '#2563EB',
                      borderColor: '#BFDBFE',
                      backgroundColor: '#EFF6FF',
                      fontWeight: 600,
                    }}
                    id="btn-counsellor-assessments-modal"
                  >
                    <Award size={16} /> Module 11: Assessments & Access Codes
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {selectedProfile && (
        <>
          <CounsellorRecommendationModal
            isOpen={recommendationModalOpen}
            onClose={() => setRecommendationModalOpen(false)}
            studentProfileId={selectedProfile.id}
            studentName={selectedProfile.fullName}
          />
          <CounsellorAssessmentModal
            isOpen={assessmentModalOpen}
            onClose={() => setAssessmentModalOpen(false)}
            studentProfileId={selectedProfile.id}
            studentName={selectedProfile.fullName}
            studentEmail={selectedProfile.contactEmail}
          />
        </>
      )}
    </div>
  );
};

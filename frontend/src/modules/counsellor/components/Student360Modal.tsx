import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  GraduationCap,
  Compass,
  Target,
  Sparkles,
  Bookmark,
  Calendar,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  Check,
  FileText,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import { CounsellorClientService, ActionPlanItem, StudentCounsellorNote } from '../services/counsellor.service';

interface Student360ModalProps {
  profileId: string;
  onClose: () => void;
  onRefresh?: () => void;
}

export const Student360Modal: React.FC<Student360ModalProps> = ({ profileId, onClose, onRefresh }) => {
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'profile' | 'academics' | 'preferences' | 'exams' | 'recommendations' | 'shortlist' | 'appointments' | 'guidance'
  >('profile');

  // New Action Plan form state
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [newPlanCategory, setNewPlanCategory] = useState('GENERAL');
  const [newPlanDate, setNewPlanDate] = useState('');
  const [newPlanPriority, setNewPlanPriority] = useState('MEDIUM');
  const [isSubmittingPlan, setIsSubmittingPlan] = useState(false);

  // New Note form state
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await CounsellorClientService.getStudent360(profileId);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.message || 'Failed to load student details');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [profileId]);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanTitle.trim()) return;
    setIsSubmittingPlan(true);
    try {
      const res = await CounsellorClientService.createActionPlan(profileId, {
        title: newPlanTitle.trim(),
        category: newPlanCategory,
        targetDate: newPlanDate || undefined,
        priority: newPlanPriority,
      });
      if (res.success) {
        setNewPlanTitle('');
        setNewPlanDate('');
        await loadData();
        if (onRefresh) onRefresh();
      }
    } catch (err: any) {
      alert(`Failed to add milestone: ${err.message}`);
    } finally {
      setIsSubmittingPlan(false);
    }
  };

  const handleTogglePlanStatus = async (item: ActionPlanItem) => {
    const nextStatus = item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await CounsellorClientService.updateActionPlan(item.id, { status: nextStatus });
      await loadData();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleDeletePlan = async (itemId: string) => {
    if (!window.confirm('Are you sure you want to remove this guidance milestone?')) return;
    try {
      await CounsellorClientService.deleteActionPlan(itemId);
      await loadData();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    setIsSubmittingNote(true);
    try {
      const res = await CounsellorClientService.createNote(profileId, {
        title: newNoteTitle.trim() || undefined,
        content: newNoteContent.trim(),
        isPrivate: true,
      });
      if (res.success) {
        setNewNoteTitle('');
        setNewNoteContent('');
        await loadData();
      }
    } catch (err: any) {
      alert(`Failed to record note: ${err.message}`);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 10, 25, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#0F172A',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '1060px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
          color: '#F8FAFC',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.7) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.2rem',
              }}
            >
              {data?.fullName ? data.fullName.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                  {data?.fullName || 'Student Dossier'}
                </h2>
                {data && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.55rem',
                      borderRadius: '9999px',
                      backgroundColor:
                        data.verificationStatus === 'VERIFIED'
                          ? 'rgba(16, 185, 129, 0.2)'
                          : data.verificationStatus === 'REJECTED'
                          ? 'rgba(239, 68, 68, 0.2)'
                          : 'rgba(245, 158, 11, 0.2)',
                      color:
                        data.verificationStatus === 'VERIFIED'
                          ? '#34D399'
                          : data.verificationStatus === 'REJECTED'
                          ? '#F87171'
                          : '#FBBF24',
                    }}
                  >
                    ● {data.verificationStatus}
                  </span>
                )}
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.825rem', color: '#94A3B8' }}>
                {data?.user?.email} • {data?.grade || 'Grade Not Set'} • {data?.board || 'Board Not Set'} • Passing: {data?.passingOutYear || 'N/A'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {data && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Profile Completion</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#A78BFA' }}>
                  {data.completionScore}%
                </div>
              </div>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#CBD5E1',
                borderRadius: '8px',
                padding: '0.45rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.25rem',
            padding: '0.5rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            overflowX: 'auto',
          }}
        >
          {[
            { id: 'profile', label: '1. Profile', icon: User },
            { id: 'academics', label: '2. Academics', icon: GraduationCap },
            { id: 'preferences', label: '3. Preferences', icon: Compass },
            { id: 'exams', label: '4. Exams & Mocks', icon: Target },
            { id: 'recommendations', label: '5. Recommendations', icon: Sparkles },
            { id: 'shortlist', label: '6. Shortlist & Aid', icon: Bookmark },
            { id: 'appointments', label: '7. Appointments', icon: Calendar },
            { id: 'guidance', label: '8. Action Plans & Notes', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem 0.9rem',
                  fontSize: '0.825rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                  border: isActive ? '1px solid rgba(167, 139, 250, 0.4)' : '1px solid transparent',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={15} color={isActive ? '#A78BFA' : '#94A3B8'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div
          style={{
            padding: '1.75rem',
            overflowY: 'auto',
            flex: 1,
            minHeight: '380px',
          }}
        >
          {isLoading && (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94A3B8' }}>
              <Clock size={32} style={{ animation: 'spin 1.5s linear infinite' }} />
              <p style={{ marginTop: '0.75rem' }}>Loading holistic student record...</p>
            </div>
          )}

          {error && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '1rem',
                borderRadius: '8px',
                color: '#FCA5A5',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'center',
              }}
            >
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {data && !isLoading && (
            <>
              {/* TAB 1: Profile & Personal */}
              {activeTab === 'profile' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                    }}
                  >
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: '#C7D2FE' }}>
                      Core Profile Details (Module 1)
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
                      <div><strong style={{ color: '#94A3B8' }}>Full Name:</strong> {data.fullName}</div>
                      <div><strong style={{ color: '#94A3B8' }}>Gender:</strong> {data.gender}</div>
                      <div><strong style={{ color: '#94A3B8' }}>Class / Grade:</strong> {data.grade}</div>
                      <div><strong style={{ color: '#94A3B8' }}>Board / Curriculum:</strong> {data.board}</div>
                      <div><strong style={{ color: '#94A3B8' }}>Citizenship:</strong> {data.citizenship}</div>
                      <div><strong style={{ color: '#94A3B8' }}>Passing Out Year:</strong> {data.passingOutYear}</div>
                      <div><strong style={{ color: '#94A3B8' }}>Assigned Counsellor:</strong> {data.assignedCounsellor ? data.assignedCounsellor.email : 'Unassigned'}</div>
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                    }}
                  >
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: '#C7D2FE' }}>
                      Contact & Address Information
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Mail size={15} color="#94A3B8" /> {data.contactEmail}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Phone size={15} color="#94A3B8" /> {data.phone}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                        <MapPin size={15} color="#94A3B8" style={{ marginTop: 3 }} />
                        <span>
                          {data.addressStreet}, {data.addressCity}, {data.addressState} {data.addressPostalCode}, {data.addressCountry}
                        </span>
                      </div>
                      {data.personalInfo && (
                        <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                          <div><strong style={{ color: '#94A3B8' }}>Guardian:</strong> {data.personalInfo.guardianName || 'N/A'} ({data.personalInfo.guardianRelationship || 'Parent'})</div>
                          <div><strong style={{ color: '#94A3B8' }}>Guardian Phone:</strong> {data.personalInfo.guardianPhone || 'N/A'}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Academics */}
              {activeTab === 'academics' && (
                <div>
                  {data.education ? (
                    <div
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                      }}
                    >
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#C7D2FE', marginBottom: '1rem' }}>
                        Senior Secondary (12th Grade) Record
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div><strong style={{ color: '#94A3B8' }}>School Name:</strong><div>{data.education.schoolName}</div></div>
                        <div><strong style={{ color: '#94A3B8' }}>Board:</strong><div>{data.education.board}</div></div>
                        <div><strong style={{ color: '#94A3B8' }}>Completion Year:</strong><div>{data.education.completionYear}</div></div>
                        <div><strong style={{ color: '#94A3B8' }}>Percentage / Aggregate:</strong><div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34D399' }}>{data.education.percentage}%</div></div>
                      </div>

                      {data.education.subjectDetails && (
                        <div>
                          <strong style={{ color: '#94A3B8', display: 'block', marginBottom: '0.5rem' }}>Subject Breakdown:</strong>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {(() => {
                              try {
                                const subs = JSON.parse(data.education.subjectDetails);
                                return Array.isArray(subs)
                                  ? subs.map((s: any, idx: number) => (
                                      <span
                                        key={idx}
                                        style={{
                                          padding: '0.3rem 0.7rem',
                                          background: 'rgba(99, 102, 241, 0.15)',
                                          border: '1px solid rgba(99, 102, 241, 0.3)',
                                          borderRadius: '6px',
                                          fontSize: '0.8rem',
                                        }}
                                      >
                                        {s.subject}: <strong>{s.score}</strong>
                                      </span>
                                    ))
                                  : null;
                              } catch {
                                return <span>{data.education.subjectDetails}</span>;
                              }
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
                      <GraduationCap size={40} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                      <p>No academic records submitted yet for this student.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Preferences */}
              {activeTab === 'preferences' && (
                <div>
                  {data.preference ? (
                    <div
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                      }}
                    >
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#C7D2FE', marginBottom: '1rem' }}>
                        Higher Education Preferences (Module 2)
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        <div>
                          <strong style={{ color: '#94A3B8' }}>Primary Study Destination:</strong>
                          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', marginTop: '0.2rem' }}>
                            {data.preference.primaryCountry || 'Not Specified'}
                          </div>
                        </div>
                        <div>
                          <strong style={{ color: '#94A3B8' }}>Target Department:</strong>
                          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', marginTop: '0.2rem' }}>
                            {data.preference.department}
                          </div>
                        </div>
                        <div>
                          <strong style={{ color: '#94A3B8' }}>Specialization / Sub-Department:</strong>
                          <div style={{ fontSize: '1rem', color: '#A78BFA', marginTop: '0.2rem' }}>
                            {data.preference.subDepartment}
                          </div>
                        </div>
                        <div>
                          <strong style={{ color: '#94A3B8' }}>Priority Countries Considered:</strong>
                          <div style={{ marginTop: '0.4rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            {(() => {
                              try {
                                const countries = JSON.parse(data.preference.countries);
                                return Array.isArray(countries)
                                  ? countries.map((c: string, idx: number) => (
                                      <span
                                        key={idx}
                                        style={{
                                          padding: '0.25rem 0.6rem',
                                          background: 'rgba(255, 255, 255, 0.08)',
                                          borderRadius: '6px',
                                          fontSize: '0.8rem',
                                        }}
                                      >
                                        🌍 {c}
                                      </span>
                                    ))
                                  : null;
                              } catch {
                                return <span>{data.preference.countries}</span>;
                              }
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
                      <Compass size={40} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                      <p>No study preferences recorded yet.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: Exams & Mocks */}
              {activeTab === 'exams' && (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#C7D2FE', marginBottom: '0.75rem' }}>
                    Target Entrance Exam Plans (Module 4 & 10)
                  </h3>
                  {data.examPlans && data.examPlans.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                      {data.examPlans.map((ep: any) => (
                        <div
                          key={ep.id}
                          style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '10px',
                            padding: '1rem',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{ep.exam?.code || 'EXAM'}</span>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.2)', color: '#A78BFA' }}>
                              {ep.status}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '0.4rem' }}>
                            Target: {ep.targetDate || 'TBD'} • Goal Score: {ep.targetScore || 'N/A'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#94A3B8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>No exam plans scheduled.</p>
                  )}

                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#C7D2FE', marginBottom: '0.75rem' }}>
                    Mock Diagnostic Attempts
                  </h3>
                  {data.mockAttempts && data.mockAttempts.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {data.mockAttempts.map((ma: any) => (
                        <div
                          key={ma.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600 }}>{ma.mockTest?.title || 'Practice Test'}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                              Time spent: {Math.round(ma.timeSpentSeconds / 60)} min • Taken on {new Date(ma.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 800, color: '#34D399', fontSize: '1.1rem' }}>{ma.percentage}%</div>
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{ma.score} / {ma.totalMarks} marks</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>No timed mock tests attempted yet.</p>
                  )}
                </div>
              )}

              {/* TAB 5: Recommendations */}
              {activeTab === 'recommendations' && (
                <div>
                  {data.recommendationBatches && data.recommendationBatches.length > 0 ? (
                    <div>
                      {data.recommendationBatches.map((batch: any) => (
                        <div
                          key={batch.id}
                          style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            borderRadius: '12px',
                            padding: '1.25rem',
                            marginBottom: '1rem',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <div>
                              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Three-Tier Recommendation Batch</span>
                              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                                Status: <strong>{batch.status}</strong> • Generated on {new Date(batch.generatedAt).toLocaleDateString()}
                              </div>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#A78BFA' }}>{batch.items?.length || 0} colleges recommended</span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {batch.items?.map((item: any) => (
                              <div
                                key={item.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '0.65rem 0.9rem',
                                  background: 'rgba(255, 255, 255, 0.02)',
                                  borderRadius: '8px',
                                  border: '1px solid rgba(255, 255, 255, 0.04)',
                                }}
                              >
                                <div>
                                  <span style={{ fontWeight: 600 }}>{item.institution?.name}</span>
                                  <span style={{ fontSize: '0.8rem', color: '#94A3B8', marginLeft: '0.5rem' }}>
                                    ({item.institution?.country})
                                  </span>
                                  {item.reasonSummary && (
                                    <div style={{ fontSize: '0.75rem', color: '#CBD5E1', marginTop: '0.15rem' }}>
                                      Rationale: {item.reasonSummary}
                                    </div>
                                  )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                  <span
                                    style={{
                                      fontSize: '0.75rem',
                                      fontWeight: 700,
                                      padding: '0.2rem 0.6rem',
                                      borderRadius: '4px',
                                      backgroundColor:
                                        item.tier === 'SAFE'
                                          ? 'rgba(16, 185, 129, 0.2)'
                                          : item.tier === 'BEST_FIT'
                                          ? 'rgba(99, 102, 241, 0.2)'
                                          : 'rgba(245, 158, 11, 0.2)',
                                      color:
                                        item.tier === 'SAFE'
                                          ? '#34D399'
                                          : item.tier === 'BEST_FIT'
                                          ? '#A78BFA'
                                          : '#FBBF24',
                                    }}
                                  >
                                    {item.tier}
                                  </span>
                                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#A78BFA' }}>
                                    Fit: {Math.round(item.fitScore)}%
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
                      <Sparkles size={40} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                      <p>No 3-tier recommendation batches generated yet for this student.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: Shortlist & Scholarships */}
              {activeTab === 'shortlist' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#C7D2FE', marginBottom: '0.75rem' }}>
                      Bookmarked Shortlist Portfolio (Module 12)
                    </h3>
                    {data.shortlistItems && data.shortlistItems.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {data.shortlistItems.map((sl: any) => (
                          <div
                            key={sl.id}
                            style={{
                              background: 'rgba(255, 255, 255, 0.03)',
                              border: '1px solid rgba(255, 255, 255, 0.06)',
                              padding: '0.65rem 0.9rem',
                              borderRadius: '8px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 600 }}>{sl.itemType}</div>
                              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>ID: {sl.itemId.slice(0, 8)}...</div>
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.2)', color: '#A78BFA' }}>
                              {sl.priority}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>No bookmarked items in shortlist.</p>
                    )}
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#C7D2FE', marginBottom: '0.75rem' }}>
                      Saved Scholarships (Module 8)
                    </h3>
                    {data.savedScholarships && data.savedScholarships.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {data.savedScholarships.map((ss: any) => (
                          <div
                            key={ss.id}
                            style={{
                              background: 'rgba(255, 255, 255, 0.03)',
                              border: '1px solid rgba(255, 255, 255, 0.06)',
                              padding: '0.65rem 0.9rem',
                              borderRadius: '8px',
                            }}
                          >
                            <div style={{ fontWeight: 600 }}>{ss.scholarship?.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                              Provider: {ss.scholarship?.provider} • Value: {ss.scholarship?.awardCurrency} {ss.scholarship?.awardAmount?.toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>No scholarships saved by student.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 7: Appointments */}
              {activeTab === 'appointments' && (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#C7D2FE', marginBottom: '0.75rem' }}>
                    Scheduled Guidance Appointments (Module 12)
                  </h3>
                  {data.appointments && data.appointments.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {data.appointments.map((apt: any) => (
                        <div
                          key={apt.id}
                          style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            padding: '1rem',
                            borderRadius: '10px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{apt.title}</div>
                              <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                                📅 {new Date(apt.scheduledAt).toLocaleString()} ({apt.durationMinutes} mins) • Counsellor: {apt.counsellor?.email}
                              </div>
                              <p style={{ fontSize: '0.825rem', color: '#CBD5E1', margin: '0.4rem 0' }}>
                                {apt.description}
                              </p>
                            </div>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                padding: '0.2rem 0.6rem',
                                borderRadius: '4px',
                                background:
                                  apt.status === 'COMPLETED'
                                    ? 'rgba(16, 185, 129, 0.2)'
                                    : 'rgba(99, 102, 241, 0.2)',
                                color: apt.status === 'COMPLETED' ? '#34D399' : '#A78BFA',
                              }}
                            >
                              {apt.status}
                            </span>
                          </div>

                          {apt.followUpActions && (
                            <div style={{ marginTop: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '6px', fontSize: '0.8rem' }}>
                              <strong style={{ color: '#C7D2FE' }}>Follow-up Actions:</strong> {apt.followUpActions}
                            </div>
                          )}

                          {apt.privateCounsellorNotes && (
                            <div style={{ marginTop: '0.35rem', padding: '0.5rem 0.75rem', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.15)', borderRadius: '6px', fontSize: '0.8rem', color: '#FDE68A' }}>
                              <strong>🔒 Staff Private Note:</strong> {apt.privateCounsellorNotes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
                      <Calendar size={40} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                      <p>No appointments recorded for this student.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 8: Action Plans & Notes */}
              {activeTab === 'guidance' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  {/* Action Plans Column */}
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#C7D2FE', marginBottom: '0.75rem' }}>
                      Student Action Plan Milestones (Module 13)
                    </h3>

                    {/* Add Milestone Form */}
                    <form
                      onSubmit={handleCreatePlan}
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '10px',
                        padding: '1rem',
                        marginBottom: '1rem',
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Add milestone title (e.g. Draft Statement of Purpose)..."
                        value={newPlanTitle}
                        onChange={(e) => setNewPlanTitle(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          background: '#0B1535',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '6px',
                          color: '#FFFFFF',
                          fontSize: '0.85rem',
                          marginBottom: '0.5rem',
                        }}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <select
                          value={newPlanCategory}
                          onChange={(e) => setNewPlanCategory(e.target.value)}
                          style={{
                            flex: 1,
                            padding: '0.45rem',
                            background: '#0B1535',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '6px',
                            color: '#FFFFFF',
                            fontSize: '0.8rem',
                          }}
                        >
                          <option value="GENERAL">General</option>
                          <option value="PROFILE">Profile Intake</option>
                          <option value="ACADEMIC">Academic Prep</option>
                          <option value="ENTRANCE_EXAM">Entrance Exam</option>
                          <option value="APPLICATION">College Application</option>
                          <option value="SCHOLARSHIP">Scholarship Aid</option>
                        </select>
                        <select
                          value={newPlanPriority}
                          onChange={(e) => setNewPlanPriority(e.target.value)}
                          style={{
                            padding: '0.45rem',
                            background: '#0B1535',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '6px',
                            color: '#FFFFFF',
                            fontSize: '0.8rem',
                          }}
                        >
                          <option value="HIGH">High Priority</option>
                          <option value="MEDIUM">Medium Priority</option>
                          <option value="LOW">Low Priority</option>
                        </select>
                        <input
                          type="date"
                          value={newPlanDate}
                          onChange={(e) => setNewPlanDate(e.target.value)}
                          style={{
                            padding: '0.45rem',
                            background: '#0B1535',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '6px',
                            color: '#FFFFFF',
                            fontSize: '0.8rem',
                          }}
                        />
                        <button
                          type="submit"
                          disabled={isSubmittingPlan}
                          style={{
                            padding: '0.45rem 0.9rem',
                            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                            border: 'none',
                            borderRadius: '6px',
                            color: '#FFFFFF',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                        >
                          <Plus size={14} /> Add
                        </button>
                      </div>
                    </form>

                    {/* Milestones List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {data.actionPlans && data.actionPlans.length > 0 ? (
                        data.actionPlans.map((item: ActionPlanItem) => (
                          <div
                            key={item.id}
                            style={{
                              background: 'rgba(255, 255, 255, 0.02)',
                              border: '1px solid rgba(255, 255, 255, 0.06)',
                              padding: '0.75rem',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              <button
                                onClick={() => handleTogglePlanStatus(item)}
                                style={{
                                  width: 22,
                                  height: 22,
                                  borderRadius: '6px',
                                  border: item.status === 'COMPLETED' ? 'none' : '1px solid rgba(255, 255, 255, 0.3)',
                                  background: item.status === 'COMPLETED' ? '#10B981' : 'transparent',
                                  color: '#FFFFFF',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                }}
                              >
                                {item.status === 'COMPLETED' && <Check size={14} />}
                              </button>
                              <div>
                                <div
                                  style={{
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    textDecoration: item.status === 'COMPLETED' ? 'line-through' : 'none',
                                    color: item.status === 'COMPLETED' ? '#94A3B8' : '#F8FAFC',
                                  }}
                                >
                                  {item.title}
                                </div>
                                <div style={{ fontSize: '0.725rem', color: '#64748B' }}>
                                  Category: {item.category} • Target: {item.targetDate || 'No date set'}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeletePlan(item.id)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#EF4444',
                                cursor: 'pointer',
                                padding: '0.2rem',
                                opacity: 0.7,
                              }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>No action plan milestones set yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Counsellor Notes Column */}
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#C7D2FE', marginBottom: '0.75rem' }}>
                      Counsellor Advisory Notes (Confidential)
                    </h3>

                    {/* Add Note Form */}
                    <form
                      onSubmit={handleCreateNote}
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '10px',
                        padding: '1rem',
                        marginBottom: '1rem',
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Subject or Session Title (optional)..."
                        value={newNoteTitle}
                        onChange={(e) => setNewNoteTitle(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          background: '#0B1535',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '6px',
                          color: '#FFFFFF',
                          fontSize: '0.85rem',
                          marginBottom: '0.5rem',
                        }}
                      />
                      <textarea
                        placeholder="Type confidential advisory notes, student observations, or background context..."
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                        rows={3}
                        required
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          background: '#0B1535',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '6px',
                          color: '#FFFFFF',
                          fontSize: '0.85rem',
                          marginBottom: '0.5rem',
                          resize: 'vertical',
                        }}
                      />
                      <button
                        type="submit"
                        disabled={isSubmittingNote}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                          border: 'none',
                          borderRadius: '6px',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                        }}
                      >
                        {isSubmittingNote ? 'Saving...' : 'Record Advisory Note'}
                      </button>
                    </form>

                    {/* Notes List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {data.counsellorNotes && data.counsellorNotes.length > 0 ? (
                        data.counsellorNotes.map((n: StudentCounsellorNote) => (
                          <div
                            key={n.id}
                            style={{
                              background: 'rgba(255, 255, 255, 0.02)',
                              border: '1px solid rgba(255, 255, 255, 0.06)',
                              padding: '0.75rem 1rem',
                              borderRadius: '8px',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#C7D2FE' }}>
                                {n.title || 'Advisory Note'}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p style={{ fontSize: '0.825rem', color: '#CBD5E1', margin: 0, whiteSpace: 'pre-wrap' }}>
                              {n.content}
                            </p>
                            <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '0.35rem' }}>
                              Recorded by: {n.counsellor?.email || 'Staff'}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>No counsellor notes recorded yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

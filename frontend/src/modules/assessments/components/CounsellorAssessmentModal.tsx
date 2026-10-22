import React, { useState, useEffect } from 'react';
import {
  AssessmentPathwayCode,
  AccessCodeRecord,
  CounsellorIntegratedReview,
  DiagnosticReport,
} from '../assessments.types';
import { AssessmentsService } from '../services/assessments.service';
import {
  X,
  Key,
  ShieldCheck,
  Award,
  CheckCircle2,
  Copy,
  Check,
  Plus,
  Trash2,
} from 'lucide-react';

interface CounsellorAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentProfileId: string;
  studentName: string;
  studentEmail?: string;
}

export const CounsellorAssessmentModal: React.FC<CounsellorAssessmentModalProps> = ({
  isOpen,
  onClose,
  studentProfileId,
  studentName,
  studentEmail,
}) => {
  const [activeTab, setActiveTab] = useState<'GENERATE' | 'CODES_LIST' | 'REVIEWS'>('GENERATE');

  // Generate code form
  const [selectedPathway, setSelectedPathway] = useState<AssessmentPathwayCode | 'ALL_PATHWAYS'>(
    'ALL_PATHWAYS'
  );
  const [assignedEmail, setAssignedEmail] = useState<string>(studentEmail || '');
  const [validityDays, setValidityDays] = useState<number>(30);
  const [maxUses, setMaxUses] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [newlyGeneratedCode, setNewlyGeneratedCode] = useState<AccessCodeRecord | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Access codes list
  const [accessCodes, setAccessCodes] = useState<AccessCodeRecord[]>([]);
  const [isLoadingCodes, setIsLoadingCodes] = useState<boolean>(false);

  // Integrated student review & reports
  const [reviewData, setReviewData] = useState<CounsellorIntegratedReview | null>(null);
  const [isLoadingReview, setIsLoadingReview] = useState<boolean>(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Action plan editor form
  const [discussionPoints, setDiscussionPoints] = useState<string[]>(['']);
  const [milestones, setMilestones] = useState<
    { title: string; targetDeadline?: string; status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' }[]
  >([{ title: '', targetDeadline: '', status: 'PENDING' }]);
  const [summaryNotes, setSummaryNotes] = useState<string>('');
  const [isSavingPlan, setIsSavingPlan] = useState<boolean>(false);
  const [planFeedback, setPlanFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  useEffect(() => {
    if (isOpen) {
      loadAccessCodes();
      loadStudentReview();
    }
  }, [isOpen, studentProfileId]);

  useEffect(() => {
    if (studentEmail) {
      setAssignedEmail(studentEmail);
    }
  }, [studentEmail]);

  const loadAccessCodes = async () => {
    setIsLoadingCodes(true);
    try {
      const res = await AssessmentsService.listAccessCodes();
      if (res.success && res.data) {
        setAccessCodes(res.data.accessCodes);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingCodes(false);
    }
  };

  const loadStudentReview = async () => {
    setIsLoadingReview(true);
    try {
      const res = await AssessmentsService.getCounsellorReview(studentProfileId);
      if (res.success && res.data) {
        setReviewData(res.data);
        if (res.data.assessmentsCompleted && res.data.assessmentsCompleted.length > 0) {
          const first = res.data.assessmentsCompleted[0];
          setSelectedReportId(first.id);
          initActionPlanFromReport(first);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingReview(false);
    }
  };

  const initActionPlanFromReport = (rep: DiagnosticReport) => {
    if (rep.counsellorActionPlan) {
      setDiscussionPoints(
        rep.counsellorActionPlan.discussionPoints.length > 0
          ? rep.counsellorActionPlan.discussionPoints
          : ['']
      );
      setMilestones(
        rep.counsellorActionPlan.actionMilestones.length > 0
          ? rep.counsellorActionPlan.actionMilestones.map((m) => ({
              title: m.title,
              targetDeadline: m.targetDeadline || '',
              status: m.status,
            }))
          : [{ title: '', targetDeadline: '', status: 'PENDING' }]
      );
      setSummaryNotes(rep.counsellorActionPlan.summaryNotes || '');
    } else {
      setDiscussionPoints(
        rep.counsellorDiscussionPrompts && rep.counsellorDiscussionPrompts.length > 0
          ? rep.counsellorDiscussionPrompts.slice(0, 3)
          : ['']
      );
      setMilestones([
        {
          title: `Discuss ${rep.pathwayTitle} findings and course directions`,
          targetDeadline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          status: 'PENDING',
        },
      ]);
      setSummaryNotes('');
    }
  };

  // Generate code
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setNewlyGeneratedCode(null);
    setCopiedCode(false);

    try {
      const res = await AssessmentsService.generateAccessCode({
        pathwayCode: selectedPathway,
        assignedStudentEmail: assignedEmail.trim() || undefined,
        validityDays: Number(validityDays),
        maxUses: Number(maxUses),
        notes: notes.trim() || undefined,
      });

      if (res.success && res.data) {
        setNewlyGeneratedCode(res.data);
        await loadAccessCodes();
      }
    } catch (err: any) {
      alert(`Generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Save action plan
  const handleSaveActionPlan = async () => {
    if (!selectedReportId) return;
    setIsSavingPlan(true);
    setPlanFeedback(null);

    const validPoints = discussionPoints.filter((p) => p.trim().length > 0);
    const validMilestones = milestones.filter((m) => m.title.trim().length > 0);

    try {
      const res = await AssessmentsService.saveActionPlan(selectedReportId, {
        discussionPoints: validPoints,
        actionMilestones: validMilestones.map((m) => ({
          title: m.title.trim(),
          targetDeadline: m.targetDeadline || undefined,
          status: m.status,
        })),
        summaryNotes: summaryNotes.trim(),
      });

      if (res.success && res.data) {
        setPlanFeedback({
          type: 'success',
          message: 'Counsellor Action Plan & Discussion Points saved successfully!',
        });
        await loadStudentReview();
      }
    } catch (err: any) {
      setPlanFeedback({
        type: 'error',
        message: err.message || 'Failed to save action plan.',
      });
    } finally {
      setIsSavingPlan(false);
    }
  };

  if (!isOpen) return null;

  const currentReport = reviewData?.assessmentsCompleted?.find((r) => r.id === selectedReportId);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(8, 20, 38, 0.85)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '18px',
          maxWidth: '960px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Modal Top Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            background: '#0B1535',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#A5B4FC',
                textTransform: 'uppercase',
              }}
            >
              <ShieldCheck size={14} /> Counsellor Assessment Portal
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.15rem 0 0', color: '#FFFFFF' }}>
              Module 11: Eight-Pathway Assessment Gateway — {studentName}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.75rem 0',
            background: '#F8FAFC',
            borderBottom: '1px solid #EAECF0',
          }}
        >
          <button
            onClick={() => setActiveTab('GENERATE')}
            style={{
              padding: '0.55rem 1rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'GENERATE' ? '2.5px solid #5B4FE9' : '2.5px solid transparent',
              color: activeTab === 'GENERATE' ? '#5B4FE9' : '#64748B',
              fontWeight: activeTab === 'GENERATE' ? 700 : 500,
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Key size={15} />
            <span>Generate Access Code</span>
          </button>

          <button
            onClick={() => setActiveTab('CODES_LIST')}
            style={{
              padding: '0.55rem 1rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'CODES_LIST' ? '2.5px solid #5B4FE9' : '2.5px solid transparent',
              color: activeTab === 'CODES_LIST' ? '#5B4FE9' : '#64748B',
              fontWeight: activeTab === 'CODES_LIST' ? 700 : 500,
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <ShieldCheck size={15} />
            <span>Active Codes ({accessCodes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('REVIEWS')}
            style={{
              padding: '0.55rem 1rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'REVIEWS' ? '2.5px solid #5B4FE9' : '2.5px solid transparent',
              color: activeTab === 'REVIEWS' ? '#5B4FE9' : '#64748B',
              fontWeight: activeTab === 'REVIEWS' ? 700 : 500,
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Award size={15} />
            <span>Completed Reports & Action Plans ({reviewData?.assessmentsCompleted?.length || 0})</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div style={{ padding: '1.75rem', overflowY: 'auto', flex: 1 }}>
          {/* TAB 1: GENERATE CODE */}
          {activeTab === 'GENERATE' && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.25rem' }}>
                  Assign Controlled Assessment Token
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#64748B', margin: 0 }}>
                  Generate an authenticated access code that unlocks targeted assessment pathways for this student.
                </p>
              </div>

              {newlyGeneratedCode && (
                <div
                  style={{
                    background: '#ECFDF5',
                    border: '1.5px solid #6EE7B7',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 800, color: '#059669' }}>
                      Access Code Generated Successfully
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#064E3B', letterSpacing: '0.05em' }}>
                      {newlyGeneratedCode.code}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#047857', marginTop: '0.2rem' }}>
                      Valid for: <strong>{newlyGeneratedCode.pathwayCode}</strong> • Expires: {newlyGeneratedCode.expiresAt.slice(0, 10)}
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopyCode(newlyGeneratedCode.code)}
                    style={{
                      background: copiedCode ? '#059669' : '#10B981',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '0.65rem 1rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
              )}

              <form onSubmit={handleGenerate} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.4rem' }}>
                    Assessment Pathway
                  </label>
                  <select
                    value={selectedPathway}
                    onChange={(e) => setSelectedPathway(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.88rem',
                      color: '#0F172A',
                    }}
                  >
                    <option value="ALL_PATHWAYS">★ Master Token: ALL 8 Pathways</option>
                    <option value="LEARNING_STYLE">1. Learning Style Assessment (VARK)</option>
                    <option value="POST_10TH_STREAM">2. Post-10th Stream & Curriculum Selector</option>
                    <option value="CAREER_PERSONALITY">3. Career Personality (Holland RIASEC)</option>
                    <option value="MULTIPLE_INTELLIGENCES">4. Multiple Intelligences (Howard Gardner)</option>
                    <option value="ENGINEERING_BRANCH">5. Engineering Branch & Specialization</option>
                    <option value="MANAGEMENT_COMMERCE">6. Management & Commerce Aptitude</option>
                    <option value="HUMANITIES_LAW_POLICY">7. Humanities, Law & Policy Affinity</option>
                    <option value="COGNITIVE_PROBLEM_SOLVING">8. Cognitive & Problem-Solving</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.4rem' }}>
                    Assigned Student Email (Optional lock)
                  </label>
                  <input
                    type="email"
                    placeholder="student@example.com"
                    value={assignedEmail}
                    onChange={(e) => setAssignedEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.4rem' }}>
                    Validity Period (Days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={validityDays}
                    onChange={(e) => setValidityDays(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.4rem' }}>
                    Max Allowed Uses
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={maxUses}
                    onChange={(e) => setMaxUses(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.4rem' }}>
                    Counsellor Assignment Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Assigned to verify post-10th stream preference following term 1 exams."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.88rem',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button
                    type="submit"
                    disabled={isGenerating}
                    style={{
                      background: 'linear-gradient(135deg, #5B4FE9 0%, #4338CA 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '0.75rem 1.75rem',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      cursor: isGenerating ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                    id="btn-generate-code-submit"
                  >
                    <Key size={16} />
                    <span>{isGenerating ? 'Generating...' : 'Create Controlled Access Code'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: ACTIVE ACCESS CODES */}
          {activeTab === 'CODES_LIST' && (
            <div>
              <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Active & Controlled Access Codes Registry
                </h3>
                <button
                  onClick={loadAccessCodes}
                  style={{
                    background: 'none',
                    border: '1px solid #CBD5E1',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                  }}
                >
                  Refresh Codes
                </button>
              </div>

              {isLoadingCodes ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                  Loading access codes...
                </div>
              ) : accessCodes.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>
                  No access codes created yet.
                </div>
              ) : (
                <div style={{ border: '1px solid #EAECF0', borderRadius: '10px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                    <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #EAECF0', color: '#475569' }}>
                      <tr>
                        <th style={{ padding: '0.75rem 1rem' }}>Code</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Pathway</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Assigned To</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Uses</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Expires</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accessCodes.map((code) => (
                        <tr key={code.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: '#5B4FE9' }}>
                            {code.code}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', color: '#0F172A' }}>
                            {code.pathwayCode}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', color: '#64748B' }}>
                            {code.assignedToStudentEmail || 'Any Authenticated Student'}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>
                            {code.usedCount} / {code.maxUses}
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span
                              style={{
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                background: code.status === 'ACTIVE' ? '#DCFCE7' : '#F1F5F9',
                                color: code.status === 'ACTIVE' ? '#15803D' : '#64748B',
                              }}
                            >
                              {code.status}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', color: '#64748B' }}>
                            {code.expiresAt.slice(0, 10)}
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <button
                              onClick={() => handleCopyCode(code.code)}
                              style={{
                                background: 'none',
                                border: '1px solid #CBD5E1',
                                borderRadius: '4px',
                                padding: '0.25rem 0.5rem',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                              }}
                            >
                              Copy
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: COMPLETED REPORTS & ACTION PLANS */}
          {activeTab === 'REVIEWS' && (
            <div>
              {isLoadingReview ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                  Loading diagnostic assessments evidence...
                </div>
              ) : !reviewData?.assessmentsCompleted || reviewData.assessmentsCompleted.length === 0 ? (
                <div
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #EAECF0',
                    borderRadius: '12px',
                    padding: '2.5rem',
                    textAlign: 'center',
                    color: '#64748B',
                  }}
                >
                  <Award size={36} color="#94A3B8" style={{ margin: '0 auto 0.75rem' }} />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.35rem' }}>
                    No completed assessments for this student yet.
                  </h3>
                  <p style={{ fontSize: '0.84rem', margin: 0 }}>
                    Assign an access code in the "Generate Access Code" tab so the student can complete an assessment.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem' }}>
                  {/* Left: Report list selector */}
                  <div style={{ borderRight: '1px solid #EAECF0', paddingRight: '1rem' }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748B', marginBottom: '0.75rem' }}>
                      Completed Reports
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {reviewData.assessmentsCompleted.map((r) => {
                        const isSelected = r.id === selectedReportId;
                        return (
                          <button
                            key={r.id}
                            onClick={() => {
                              setSelectedReportId(r.id);
                              initActionPlanFromReport(r);
                            }}
                            style={{
                              textAlign: 'left',
                              padding: '0.75rem',
                              borderRadius: '8px',
                              background: isSelected ? 'rgba(91, 79, 233, 0.08)' : '#F8FAFC',
                              border: isSelected ? '1.5px solid #5B4FE9' : '1px solid #EAECF0',
                              cursor: 'pointer',
                            }}
                          >
                            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A' }}>
                              {r.pathwayTitle}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '0.2rem' }}>
                              {r.completedAt ? r.completedAt.slice(0, 10) : 'Recent'}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right: Selected report overview & action plan editor */}
                  {currentReport && (
                    <div>
                      {planFeedback && (
                        <div
                          style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            fontSize: '0.84rem',
                            marginBottom: '1rem',
                            background: planFeedback.type === 'success' ? '#DCFCE7' : '#FEE2E2',
                            color: planFeedback.type === 'success' ? '#15803D' : '#DC2626',
                          }}
                        >
                          {planFeedback.message}
                        </div>
                      )}

                      {/* Report Quick Summary */}
                      <div
                        style={{
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '10px',
                          padding: '1rem 1.25rem',
                          marginBottom: '1.5rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                            {currentReport.pathwayTitle} Evidence
                          </h4>
                          <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                            {currentReport.completedAt?.slice(0, 10)}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '0.5rem' }}>
                          <strong>Dominant Cluster:</strong> {currentReport.dominantClusters?.join(', ')}
                        </div>

                        <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                          <strong>Top Matching Streams:</strong> {currentReport.matchingStreams?.join(' • ')}
                        </div>
                      </div>

                      {/* Discussion Points Section */}
                      <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <label style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0F172A' }}>
                            Counsellor Discussion Points:
                          </label>
                          <button
                            type="button"
                            onClick={() => setDiscussionPoints([...discussionPoints, ''])}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#5B4FE9',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <Plus size={14} /> Add Point
                          </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {discussionPoints.map((pt, pIdx) => (
                            <div key={pIdx} style={{ display: 'flex', gap: '0.5rem' }}>
                              <input
                                type="text"
                                placeholder={`Discussion prompt ${pIdx + 1}`}
                                value={pt}
                                onChange={(e) => {
                                  const updated = [...discussionPoints];
                                  updated[pIdx] = e.target.value;
                                  setDiscussionPoints(updated);
                                }}
                                style={{
                                  flex: 1,
                                  padding: '0.5rem 0.75rem',
                                  borderRadius: '6px',
                                  border: '1px solid #CBD5E1',
                                  fontSize: '0.84rem',
                                }}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setDiscussionPoints(discussionPoints.filter((_, idx) => idx !== pIdx))
                                }
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#94A3B8',
                                  cursor: 'pointer',
                                  padding: '0.4rem',
                                }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Milestones Section */}
                      <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <label style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0F172A' }}>
                            Agreed Action Milestones:
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setMilestones([
                                ...milestones,
                                { title: '', targetDeadline: '', status: 'PENDING' },
                              ])
                            }
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#5B4FE9',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <Plus size={14} /> Add Milestone
                          </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {milestones.map((ms, mIdx) => (
                            <div
                              key={mIdx}
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 140px 110px 32px',
                                gap: '0.5rem',
                                alignItems: 'center',
                              }}
                            >
                              <input
                                type="text"
                                placeholder="Milestone description"
                                value={ms.title}
                                onChange={(e) => {
                                  const updated = [...milestones];
                                  updated[mIdx].title = e.target.value;
                                  setMilestones(updated);
                                }}
                                style={{
                                  padding: '0.5rem 0.65rem',
                                  borderRadius: '6px',
                                  border: '1px solid #CBD5E1',
                                  fontSize: '0.82rem',
                                }}
                              />
                              <input
                                type="date"
                                value={ms.targetDeadline || ''}
                                onChange={(e) => {
                                  const updated = [...milestones];
                                  updated[mIdx].targetDeadline = e.target.value;
                                  setMilestones(updated);
                                }}
                                style={{
                                  padding: '0.5rem 0.4rem',
                                  borderRadius: '6px',
                                  border: '1px solid #CBD5E1',
                                  fontSize: '0.78rem',
                                }}
                              />
                              <select
                                value={ms.status}
                                onChange={(e) => {
                                  const updated = [...milestones];
                                  updated[mIdx].status = e.target.value as any;
                                  setMilestones(updated);
                                }}
                                style={{
                                  padding: '0.5rem 0.35rem',
                                  borderRadius: '6px',
                                  border: '1px solid #CBD5E1',
                                  fontSize: '0.78rem',
                                }}
                              >
                                <option value="PENDING">PENDING</option>
                                <option value="IN_PROGRESS">IN_PROGRESS</option>
                                <option value="COMPLETED">COMPLETED</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => setMilestones(milestones.filter((_, idx) => idx !== mIdx))}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#94A3B8',
                                  cursor: 'pointer',
                                }}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Summary Notes */}
                      <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.4rem' }}>
                          Counsellor Synthesis & Summary Guidance:
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Synthesize overall assessment evidence, academic standing, and strategic recommendations for the student."
                          value={summaryNotes}
                          onChange={(e) => setSummaryNotes(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.65rem 0.75rem',
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            fontSize: '0.85rem',
                            fontFamily: 'inherit',
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={handleSaveActionPlan}
                          disabled={isSavingPlan}
                          style={{
                            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '0.65rem 1.5rem',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.88rem',
                            cursor: isSavingPlan ? 'not-allowed' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)',
                          }}
                          id="btn-save-counsellor-action-plan"
                        >
                          <CheckCircle2 size={16} />
                          <span>{isSavingPlan ? 'Saving...' : 'Save Counsellor Action Plan'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

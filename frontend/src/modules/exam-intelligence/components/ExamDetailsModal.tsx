import React, { useEffect, useState } from 'react';
import {
  X,
  Award,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { RecommendedExamItem } from '../exam-intelligence.types';
import { EntranceService } from '../../entrance/services/entrance.service';
import { EntranceExamRecord } from '../../entrance/entrance.types';

interface ExamDetailsModalProps {
  examItem: RecommendedExamItem;
  onClose: () => void;
  onOpenPrepPlan: (exam: RecommendedExamItem) => void;
  onLaunchMockTest: (exam: RecommendedExamItem) => void;
}

export const ExamDetailsModal: React.FC<ExamDetailsModalProps> = ({
  examItem,
  onClose,
  onOpenPrepPlan,
  onLaunchMockTest,
}) => {
  const [fullExam, setFullExam] = useState<EntranceExamRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await EntranceService.getExamById(examItem.examId);
        if (res.success && res.data) {
          setFullExam(res.data);
        }
      } catch (err) {
        console.error('Failed to load exam details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [examItem.examId]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: '800px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid #E2E8F0',
            background: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Award size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  {examItem.name}
                </h3>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px', background: '#EEF2FF', color: '#4F46E5' }}>
                  {examItem.code}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '2px 0 0 0' }}>
                Standardized admissions testing intelligence & section guidelines
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
              padding: '0.4rem',
              display: 'flex',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B', fontSize: '0.9rem' }}>
              Loading structured examination details...
            </div>
          ) : (
            <>
              {/* Quick Specs Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.85rem' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Format</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                    {fullExam?.format || examItem.format}
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.85rem' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Duration</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                    {fullExam?.totalDurationMinutes || examItem.durationMinutes} Minutes
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.85rem' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Score Range</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                    {fullExam?.scoreRange || examItem.scoreRange}
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.85rem' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Score Validity</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                    {fullExam?.validity || examItem.validity}
                  </div>
                </div>
              </div>

              {/* Description */}
              {fullExam?.description && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                    Comprehensive Overview
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
                    {fullExam.description}
                  </p>
                </div>
              )}

              {/* Sections Breakdown */}
              {fullExam?.sections && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                    Test Sections & Timings
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {(() => {
                      const sectionsList = Array.isArray(fullExam.sections) ? fullExam.sections : [];
                      return sectionsList.map((sec, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px',
                            padding: '0.65rem 0.95rem',
                          }}
                        >
                          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1E293B' }}>
                            {sec.name}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                            {sec.questions ? `${sec.questions} questions` : ''}
                            {sec.questions && sec.durationMinutes ? ' • ' : ''}
                            {sec.durationMinutes ? `${sec.durationMinutes} mins` : ''}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}

              {/* Scoring Details */}
              {fullExam?.scoringDetails && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                    Scoring Scale & Benchmarks
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                    {fullExam.scoringDetails}
                  </p>
                </div>
              )}

              {/* Test-Day Tips */}
              {fullExam?.testDayTips && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                    Official Test-Day Tips
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {(() => {
                      const tipsList = Array.isArray(fullExam.testDayTips) ? fullExam.testDayTips : [];
                      return tipsList.map((tip, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.5rem',
                            fontSize: '0.825rem',
                            color: '#334155',
                          }}
                        >
                          <CheckCircle2 size={15} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span>{tip}</span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '1rem 1.75rem',
            borderTop: '1px solid #E2E8F0',
            background: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <a
            href={examItem.officialWebsiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#4F46E5',
              fontSize: '0.85rem',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            <span>Official Portal Registration</span>
            <ExternalLink size={15} />
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => {
                onClose();
                onOpenPrepPlan(examItem);
              }}
              style={{
                padding: '0.55rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              View Prep Path
            </button>

            {examItem.hasMockTest && (
              <button
                onClick={() => {
                  onClose();
                  onLaunchMockTest(examItem);
                }}
                style={{
                  padding: '0.55rem 1.15rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
                }}
              >
                Launch Mock Test
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

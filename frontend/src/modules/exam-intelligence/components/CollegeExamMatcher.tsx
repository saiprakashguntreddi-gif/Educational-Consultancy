import React, { useState } from 'react';
import {
  Building2,
  BookOpen,
  Award,
  Clock,
  CheckCircle2,
  Plus,
  PlayCircle,
  Search,
} from 'lucide-react';
import {
  CollegeExamRequirement,
  RecommendedExamItem,
} from '../exam-intelligence.types';

interface CollegeExamMatcherProps {
  collegeRequirements: CollegeExamRequirement[];
  recommendedExams: RecommendedExamItem[];
  onOpenExamDetail: (exam: RecommendedExamItem) => void;
  onOpenPrepPlan: (exam: RecommendedExamItem) => void;
  onLaunchMockTest: (exam: RecommendedExamItem) => void;
  onAddToPlan: (exam: RecommendedExamItem) => void;
}

export const CollegeExamMatcher: React.FC<CollegeExamMatcherProps> = ({
  collegeRequirements,
  recommendedExams,
  onOpenExamDetail,
  onOpenPrepPlan,
  onLaunchMockTest,
  onAddToPlan,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter exams
  const filteredExams = recommendedExams.filter((exam) => {
    const matchesCategory =
      selectedCategory === 'ALL'
        ? true
        : selectedCategory === 'COLLEGE_REQUIRED'
        ? exam.requiredByInstitutions.length > 0
        : exam.category === selectedCategory;

    const matchesSearch =
      exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.destinations.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. SHORTLISTED COLLEGES & COURSE EXAM REQUIREMENTS */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          padding: '1.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(79, 70, 229, 0.08)', padding: '0.2rem 0.6rem', borderRadius: '6px', marginBottom: '0.35rem' }}>
              <Building2 size={13} /> Step 1: College Admissions Intelligence
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Entrance Exams Required by Your Shortlisted Colleges
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#64748B', margin: '0.25rem 0 0 0' }}>
              We analyzed the official admission criteria for your saved universities and programs to identify mandatory entrance and language proficiency tests.
            </p>
          </div>
        </div>

        {collegeRequirements.length === 0 ? (
          <div
            style={{
              padding: '2.5rem 1.5rem',
              background: '#F8FAFC',
              borderRadius: '12px',
              border: '1px dashed #CBD5E1',
              textAlign: 'center',
            }}
          >
            <Building2 size={36} style={{ color: '#94A3B8', margin: '0 auto 0.75rem auto' }} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1E293B', margin: '0 0 0.35rem 0' }}>
              No Shortlisted Colleges or Courses Yet
            </h4>
            <p style={{ fontSize: '0.875rem', color: '#64748B', maxWidth: '520px', margin: '0 auto 1.25rem auto' }}>
              Bookmark universities in the College & Course Discovery section, and our intelligence engine will automatically cross-reference their exam requirements here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {collegeRequirements.map((college) => (
              <div
                key={college.institutionId}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      {college.institutionName}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                      {college.city ? `${college.city}, ` : ''}{college.country}
                    </span>
                  </div>
                  {college.avgSatRequirement && (
                    <div style={{ fontSize: '0.78rem', color: '#4F46E5', fontWeight: 600, marginTop: '0.2rem' }}>
                      Benchmark SAT Target: ~{college.avgSatRequirement}
                    </div>
                  )}
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                    Mandatory & Recommended Tests:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {college.allRequiredExams.length === 0 ? (
                      <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontStyle: 'italic' }}>
                        Holistic admission / Review course specifications
                      </span>
                    ) : (
                      college.allRequiredExams.map((examCode) => (
                        <span
                          key={examCode}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: '#EEF2FF',
                            color: '#4338CA',
                            border: '1px solid #C7D2FE',
                          }}
                        >
                          <CheckCircle2 size={12} color="#4F46E5" /> {examCode}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {college.courses.length > 0 && (
                  <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.65rem', fontSize: '0.78rem', color: '#475569' }}>
                    <span style={{ fontWeight: 600 }}>Programs checked: </span>
                    {college.courses.map((c) => c.courseName).join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. EXAM DISCOVERY & INTELLIGENCE CATALOGUE */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          padding: '1.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Entrance Exam Intelligence Catalogue
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
              Standardized format, sections, scoring benchmarks, diagnostic mock tests, and verified registration links.
            </p>
          </div>

          {/* Search Field */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search exam (SAT, IELTS, GRE)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.85rem 0.55rem 2.3rem',
                fontSize: '0.85rem',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                background: '#F8FAFC',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {[
            { id: 'ALL', label: 'All Exams' },
            { id: 'COLLEGE_REQUIRED', label: 'Required by My Colleges' },
            { id: 'UNDERGRADUATE', label: 'Undergraduate' },
            { id: 'POSTGRADUATE', label: 'Postgraduate' },
            { id: 'LANGUAGE_PROFICIENCY', label: 'Language Tests' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              style={{
                padding: '0.45rem 0.9rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: '8px',
                border: '1px solid',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                background: selectedCategory === tab.id ? '#0F172A' : '#F1F5F9',
                color: selectedCategory === tab.id ? '#FFFFFF' : '#475569',
                borderColor: selectedCategory === tab.id ? '#0F172A' : '#E2E8F0',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Exam Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredExams.map((exam) => (
            <div
              key={exam.examId}
              style={{
                background: '#FFFFFF',
                border: exam.requiredByInstitutions.length > 0 ? '1.5px solid #6366F1' : '1px solid #E2E8F0',
                borderRadius: '14px',
                padding: '1.4rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: exam.requiredByInstitutions.length > 0 ? '0 4px 14px rgba(99, 102, 241, 0.08)' : '0 1px 3px rgba(0, 0, 0, 0.04)',
                position: 'relative',
              }}
            >
              {exam.requiredByInstitutions.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '16px',
                    background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                    color: '#FFFFFF',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '20px',
                    boxShadow: '0 2px 6px rgba(99, 102, 241, 0.3)',
                  }}
                >
                  Required by {exam.requiredByInstitutions.length} College{exam.requiredByInstitutions.length > 1 ? 's' : ''}
                </div>
              )}

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '5px',
                      background: '#F1F5F9',
                      color: '#475569',
                    }}
                  >
                    {exam.category.replace('_', ' ')}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={13} /> {exam.durationMinutes} min
                  </span>
                </div>

                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.35rem 0' }}>
                  {exam.name}
                </h4>

                <div style={{ fontSize: '0.825rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontWeight: 600, color: '#1E293B' }}>Score Scale: </span>
                    {exam.scoreRange}
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, color: '#1E293B' }}>Format: </span>
                    {exam.format}
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, color: '#1E293B' }}>Validity: </span>
                    {exam.validity}
                  </div>
                </div>

                {exam.requiredByInstitutions.length > 0 && (
                  <div style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: '8px', padding: '0.6rem 0.75rem', marginBottom: '1rem', fontSize: '0.76rem', color: '#5B21B6' }}>
                    <span style={{ fontWeight: 700 }}>Requested by: </span>
                    {exam.requiredByInstitutions.join(', ')}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    onClick={() => onOpenExamDetail(exam)}
                    style={{
                      padding: '0.45rem 0.6rem',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      borderRadius: '7px',
                      border: '1px solid #CBD5E1',
                      background: '#FFFFFF',
                      color: '#334155',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <BookOpen size={14} /> Details
                  </button>

                  <button
                    onClick={() => onOpenPrepPlan(exam)}
                    style={{
                      padding: '0.45rem 0.6rem',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      borderRadius: '7px',
                      border: '1px solid #C7D2FE',
                      background: '#EEF2FF',
                      color: '#4338CA',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <Award size={14} /> Prep Path
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: exam.hasMockTest ? '1fr 1fr' : '1fr', gap: '0.5rem' }}>
                  {exam.hasMockTest && (
                    <button
                      onClick={() => onLaunchMockTest(exam)}
                      style={{
                        padding: '0.45rem 0.6rem',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        borderRadius: '7px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        color: '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        boxShadow: '0 2px 6px rgba(5, 150, 105, 0.2)',
                      }}
                    >
                      <PlayCircle size={14} /> Mock Test
                    </button>
                  )}

                  <button
                    onClick={() => onAddToPlan(exam)}
                    style={{
                      padding: '0.45rem 0.6rem',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      borderRadius: '7px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      boxShadow: '0 2px 6px rgba(99, 102, 241, 0.25)',
                    }}
                  >
                    <Plus size={14} /> Add to Plan
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

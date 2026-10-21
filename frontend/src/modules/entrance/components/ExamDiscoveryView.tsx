import React, { useState, useMemo } from 'react';
import {
  Search,
  ExternalLink,
  Check,
  Plus,
  PlayCircle,
  Clock,
  Award,
  Sparkles,
  Info,
} from 'lucide-react';
import { EntranceExamRecord } from '../entrance.types';

interface ExamDiscoveryViewProps {
  exams: EntranceExamRecord[];
  onSelectExam: (exam: EntranceExamRecord) => void;
  onAddToPlan: (exam: EntranceExamRecord) => void;
  onTakeMockTest: (exam: EntranceExamRecord) => void;
  isLoading: boolean;
}

export const ExamDiscoveryView: React.FC<ExamDiscoveryViewProps> = ({
  exams,
  onSelectExam,
  onAddToPlan,
  onTakeMockTest,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDestination, setSelectedDestination] = useState<string>('ALL');

  const safeExams = Array.isArray(exams) ? exams : [];

  // Extract unique destinations across all exams
  const availableDestinations = useMemo(() => {
    const set = new Set<string>();
    safeExams.forEach((exam) => {
      exam?.destinations?.forEach((dest) => set.add(dest));
    });
    return Array.from(set).sort();
  }, [safeExams]);

  // Filter exams based on search, category, and destination
  const filteredExams = useMemo(() => {
    return safeExams.filter((exam) => {
      if (!exam) return false;
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = exam.name.toLowerCase().includes(q);
        const matchesCode = exam.code.toLowerCase().includes(q);
        const matchesDesc = exam.description.toLowerCase().includes(q);
        const matchesFormat = exam.format.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesDesc && !matchesFormat) {
          return false;
        }
      }

      // 2. Category
      if (selectedCategory !== 'ALL' && exam.category !== selectedCategory) {
        return false;
      }

      // 3. Destination
      if (selectedDestination !== 'ALL') {
        const matchesDest = exam.destinations?.some(
          (d) => d.toLowerCase() === selectedDestination.toLowerCase()
        );
        if (!matchesDest) return false;
      }

      return true;
    });
  }, [exams, searchQuery, selectedCategory, selectedDestination]);

  return (
    <div id="exam-discovery-container">
      {/* Search and Filters Toolbar */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {/* Top row: Search input & Destination dropdown */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            {/* Search Input */}
            <div style={{ flex: '1 1 280px', position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Search size={18} />
              </div>
              <input
                id="exam-search-input"
                type="text"
                placeholder="Search exams by name, code, format (e.g. SAT, IELTS, GRE)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '0.65rem 1rem 0.65rem 2.4rem',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.9rem',
                  color: '#0F172A',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
              />
            </div>

            {/* Destination Dropdown */}
            <div style={{ minWidth: '220px', flex: '0 1 240px' }}>
              <select
                id="exam-destination-filter"
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.9rem',
                  color: '#0F172A',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="ALL">All Study Destinations</option>
                {availableDestinations.map((dest) => (
                  <option key={dest} value={dest}>
                    {dest}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bottom row: Category Filter Pills */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#64748B',
                marginRight: '0.35rem',
              }}
            >
              Category:
            </span>

            {[
              { label: 'All Exams', value: 'ALL' },
              { label: 'Undergraduate', value: 'UNDERGRADUATE' },
              { label: 'Postgraduate', value: 'POSTGRADUATE' },
              { label: 'Language Proficiency', value: 'LANGUAGE_PROFICIENCY' },
            ].map((cat) => (
              <button
                key={cat.value}
                id={`filter-cat-${cat.value.toLowerCase()}`}
                onClick={() => setSelectedCategory(cat.value)}
                style={{
                  background: selectedCategory === cat.value ? '#4338CA' : '#F1F5F9',
                  color: selectedCategory === cat.value ? '#FFFFFF' : '#475569',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div
          id="exams-loading-state"
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '4rem 1.5rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              border: '3px solid #E2E8F0',
              borderTopColor: '#5B4FE9',
              borderRadius: '50%',
              margin: '0 auto 1rem',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
            Loading Entrance Exams Catalogue...
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.3rem' }}>
            Retrieving official test formats, scoring criteria, and recommendations.
          </p>
        </div>
      ) : filteredExams.length === 0 ? (
        /* Empty State */
        <div
          id="exams-empty-state"
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '3.5rem 1.5rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: '#F1F5F9',
              color: '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <Info size={24} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
            No entrance exams match your current filters
          </h3>
          <p
            style={{
              fontSize: '0.88rem',
              color: '#64748B',
              maxWidth: '460px',
              margin: '0.5rem auto 1.25rem',
              lineHeight: 1.5,
            }}
          >
            Try clearing your search keyword or switching your category filter to explore all available standardized exams.
          </p>
          <button
            id="reset-exam-filters-btn"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
              setSelectedDestination('ALL');
            }}
            style={{
              background: '#5B4FE9',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.55rem 1.25rem',
              borderRadius: '8px',
              fontSize: '0.86rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Exams Grid */
        <div
          id="exams-catalog-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filteredExams.map((exam) => (
            <div
              key={exam.id}
              id={`exam-card-${exam.code.toLowerCase()}`}
              style={{
                background: '#FFFFFF',
                border: exam.isRecommendedForStudent ? '1.5px solid #818CF8' : '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '1.35rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: exam.isRecommendedForStudent
                  ? '0 4px 12px rgba(91, 79, 233, 0.08)'
                  : '0 1px 3px rgba(0,0,0,0.02)',
                position: 'relative',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
            >
              <div>
                {/* Top badges row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    marginBottom: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <span
                      style={{
                        background: '#EEF2FF',
                        color: '#4338CA',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {exam.code}
                    </span>
                    <span
                      style={{
                        background: '#F1F5F9',
                        color: '#475569',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                      }}
                    >
                      {exam.category.replace('_', ' ')}
                    </span>
                  </div>

                  {exam.isRecommendedForStudent && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        background: '#ECFDF5',
                        color: '#059669',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                        border: '1px solid #A7F3D0',
                      }}
                    >
                      <Sparkles size={12} />
                      Recommended
                    </span>
                  )}
                </div>

                {/* Exam Title */}
                <h3
                  style={{
                    fontSize: '1.08rem',
                    fontWeight: 800,
                    color: '#0F172A',
                    margin: '0 0 0.45rem',
                    lineHeight: 1.35,
                  }}
                >
                  {exam.name}
                </h3>

                {/* Description snippet */}
                <p
                  style={{
                    fontSize: '0.84rem',
                    color: '#475569',
                    lineHeight: 1.5,
                    margin: '0 0 1rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {exam.description}
                </p>

                {/* Quick specs pill row */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    background: '#F8FAFC',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    border: '1px solid #F1F5F9',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#334155' }}>
                    <Clock size={13} color="#64748B" />
                    <span>{exam.totalDurationMinutes} mins</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#334155' }}>
                    <Award size={13} color="#64748B" />
                    <span>Score: {exam.scoreRange}</span>
                  </div>
                </div>

                {/* Study Destinations */}
                <div style={{ marginBottom: '1.15rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.03em' }}>
                    Key Study Destinations:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {exam.destinations?.slice(0, 4).map((dest, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.74rem',
                          background: '#F1F5F9',
                          color: '#334155',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                        }}
                      >
                        {dest}
                      </span>
                    ))}
                    {exam.destinations && exam.destinations.length > 4 && (
                      <span
                        style={{
                          fontSize: '0.74rem',
                          color: '#64748B',
                          padding: '0.15rem 0.35rem',
                        }}
                      >
                        +{exam.destinations.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div
                style={{
                  borderTop: '1px solid #F1F5F9',
                  paddingTop: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', gap: '0.45rem' }}>
                  <button
                    id={`view-details-${exam.code.toLowerCase()}`}
                    onClick={() => onSelectExam(exam)}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      color: '#0F172A',
                      padding: '0.45rem 0.85rem',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    View Details
                  </button>

                  <a
                    href={exam.officialWebsiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Official registration portal"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      color: '#475569',
                      padding: '0.45rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    <span>Portal</span>
                    <ExternalLink size={13} />
                  </a>
                </div>

                <div style={{ display: 'flex', gap: '0.45rem' }}>
                  {exam.hasMockTest && (
                    <button
                      id={`take-mock-${exam.code.toLowerCase()}`}
                      onClick={() => onTakeMockTest(exam)}
                      title="Take diagnostic timed practice test"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        background: '#6D28D9',
                        border: 'none',
                        color: '#FFFFFF',
                        padding: '0.45rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <PlayCircle size={14} />
                      <span>Mock</span>
                    </button>
                  )}

                  <button
                    id={`add-plan-btn-${exam.code.toLowerCase()}`}
                    onClick={() => onAddToPlan(exam)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      background: exam.studentPlanStatus ? '#DCFCE7' : '#0F172A',
                      border: 'none',
                      color: exam.studentPlanStatus ? '#166534' : '#FFFFFF',
                      padding: '0.45rem 0.85rem',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {exam.studentPlanStatus ? (
                      <>
                        <Check size={14} />
                        <span>{exam.studentPlanStatus}</span>
                      </>
                    ) : (
                      <>
                        <Plus size={14} />
                        <span>Add Plan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  RefreshCw,
  Layers,
  ChevronRight,
} from 'lucide-react';
import {
  RecommendationBatchDto,
  RecommendationItemDto,
  RecommendationTier,
} from '../recommendations.types';
import { RecommendationsService } from '../services/recommendations.service';
import { RecommendationCard } from './RecommendationCard';
import { EvidenceModal } from './EvidenceModal';
import { CohortScatterPlotModal } from './CohortScatterPlotModal';

interface ThreeTierFitViewProps {
  onNavigateSection?: (section: string) => void;
}

export const ThreeTierFitView: React.FC<ThreeTierFitViewProps> = ({
  onNavigateSection,
}) => {
  const [batch, setBatch] = useState<RecommendationBatchDto | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(true);
  const [verificationStatus, setVerificationStatus] = useState<string>('VERIFIED');
  const [verificationNotice, setVerificationNotice] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'ALL' | RecommendationTier | 'ALTERNATIVES'>('ALL');
  const [selectedItemForEvidence, setSelectedItemForEvidence] = useState<RecommendationItemDto | null>(null);
  const [selectedItemForScatter, setSelectedItemForScatter] = useState<RecommendationItemDto | null>(null);
  const [shortlistLoadingId, setShortlistLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const res = await RecommendationsService.getMyRecommendations();
      if (res.success && res.data) {
        setIsVerified(res.data.isVerified);
        setVerificationStatus(res.data.verificationStatus);
        setVerificationNotice(res.data.message || '');
        setBatch(res.data.batch);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load recommendations' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setFeedback(null);
    try {
      const res = await RecommendationsService.generateRecommendations();
      if (res.success && res.data) {
        setBatch(res.data);
        setFeedback({ type: 'success', message: 'Balanced recommendation strategy freshly generated!' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to regenerate recommendations' });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleToggleShortlist = async (itemId: string) => {
    setShortlistLoadingId(itemId);
    try {
      const res = await RecommendationsService.toggleShortlist(itemId);
      if (res.success && res.data) {
        // Update local item state
        if (batch) {
          const updateItems = (items: RecommendationItemDto[]) =>
            items.map((it) =>
              it.id === itemId ? { ...it, isShortlisted: res.data!.isShortlisted } : it
            );

          setBatch({
            ...batch,
            items: updateItems(batch.items),
            alternatives: updateItems(batch.alternatives),
            counts: {
              ...batch.counts,
              shortlisted: res.data.isShortlisted
                ? batch.counts.shortlisted + 1
                : Math.max(0, batch.counts.shortlisted - 1),
            },
          });

          if (selectedItemForEvidence && selectedItemForEvidence.id === itemId) {
            setSelectedItemForEvidence({
              ...selectedItemForEvidence,
              isShortlisted: res.data.isShortlisted,
            });
          }
        }
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Could not update shortlist' });
    } finally {
      setShortlistLoadingId(null);
    }
  };

  // Filter items based on activeTab
  const visibleItems = () => {
    if (!batch) return [];
    if (activeTab === 'ALTERNATIVES') return batch.alternatives;
    if (activeTab === 'ALL') return batch.items;
    return batch.items.filter((i) => i.effectiveTier === activeTab);
  };

  // 1. UNVERIFIED PROFILE STATE
  if (!isLoading && !isVerified) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
        <div
          style={{
            background: 'linear-gradient(145deg, #121F47 0%, #1E1B4B 100%)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '20px',
            padding: '3rem 2rem',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: '16px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FBBF24',
              marginBottom: '1.25rem',
            }}
          >
            <ShieldCheck size={32} />
          </div>

          <div
            style={{
              display: 'inline-block',
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#FDE68A',
              padding: '0.25rem 0.85rem',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: '1rem',
              border: '1px solid rgba(245, 158, 11, 0.3)',
            }}
          >
            Verification Status: {verificationStatus}
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.75rem' }}>
            Academic Profile Verification Required
          </h2>

          <p
            style={{
              color: '#CBD5E1',
              fontSize: '1rem',
              maxWidth: '640px',
              margin: '0 auto 2rem auto',
              lineHeight: 1.6,
            }}
          >
            {verificationNotice ||
              'The recommendation engine turns validated academic credentials and study preferences into an understandable, strategic application plan. A certified educational counsellor must review and authenticate your academic records before official three-tier recommendations can be generated.'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigateSection?.('basic')}
              className="btn-primary-indigo"
              style={{ padding: '0.75rem 1.5rem', fontSize: '0.92rem' }}
            >
              <span>Review Profile Intake</span>
              <ChevronRight size={16} />
            </button>

            <button
              onClick={() => onNavigateSection?.('education')}
              className="btn-secondary-outline"
              style={{ padding: '0.75rem 1.5rem', fontSize: '0.92rem' }}
            >
              <span>Verify Education Details</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.25)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
              Three-Tier Fit & Application Strategy
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '0.925rem', marginTop: '0.35rem', maxWidth: '680px', lineHeight: 1.5 }}>
              Compare your academic credentials against college admission benchmarks to build a balanced, transparent application portfolio.
            </p>
          </div>

          <button
            onClick={handleRegenerate}
            disabled={isRegenerating || isLoading}
            className="btn-secondary-outline"
            style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}
          >
            <RefreshCw size={15} className={isRegenerating ? 'spin' : ''} />
            <span>{isRegenerating ? 'Recalculating...' : 'Regenerate Strategy'}</span>
          </button>
        </div>

        {/* Strategy Metrics Grid */}
        {batch && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              {/* Total Card */}
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Total Recommended</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.2rem' }}>
                  {batch.counts.total}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.1rem' }}>
                  Primary Balanced List
                </div>
              </div>

              {/* Safe Card */}
              <div style={{ background: 'rgba(34, 197, 94, 0.06)', border: '1px solid rgba(34, 197, 94, 0.25)', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#86EFAC', fontWeight: 600 }}>Safe Options</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#4ADE80', marginTop: '0.2rem' }}>
                  {batch.counts.safe}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#86EFAC', marginTop: '0.1rem' }}>
                  &gt;95% Admission Likelihood
                </div>
              </div>

              {/* Best-Fit Card */}
              <div style={{ background: 'rgba(99, 102, 241, 0.06)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#C7D2FE', fontWeight: 600 }}>Best-Fit Matches</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#A5B4FC', marginTop: '0.2rem' }}>
                  {batch.counts.bestFit}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#C7D2FE', marginTop: '0.1rem' }}>
                  50% – 95% Admission Chance
                </div>
              </div>

              {/* Aspirational Card */}
              <div style={{ background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#FDE68A', fontWeight: 600 }}>Aspirational Targets</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FCD34D', marginTop: '0.2rem' }}>
                  {batch.counts.aspirational}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#FDE68A', marginTop: '0.1rem' }}>
                  &lt;50% Reach Targets
                </div>
              </div>
            </div>

            {/* Balanced Distribution Visual Meter */}
            <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                <span style={{ color: '#E2E8F0', fontWeight: 600 }}>Portfolio Distribution:</span>
                <span style={{ color: '#A78BFA' }}>{batch.strategySummary}</span>
              </div>

              <div style={{ display: 'flex', height: '10px', borderRadius: '5px', overflow: 'hidden', gap: '2px' }}>
                <div
                  style={{
                    flex: batch.counts.safe || 1,
                    background: '#22C55E',
                    borderRadius: '3px',
                  }}
                  title={`Safe: ${batch.counts.safe}`}
                />
                <div
                  style={{
                    flex: batch.counts.bestFit || 1,
                    background: '#6366F1',
                    borderRadius: '3px',
                  }}
                  title={`Best-Fit: ${batch.counts.bestFit}`}
                />
                <div
                  style={{
                    flex: batch.counts.aspirational || 1,
                    background: '#F59E0B',
                    borderRadius: '3px',
                  }}
                  title={`Aspirational: ${batch.counts.aspirational}`}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          style={{
            background: feedback.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${feedback.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            color: feedback.type === 'success' ? '#4ADE80' : '#FCA5A5',
            padding: '0.85rem 1.25rem',
            borderRadius: '12px',
            fontSize: '0.9rem',
          }}
        >
          {feedback.message}
        </div>
      )}

      {/* Counsellor Advisory Note (If approved or notes added) */}
      {batch?.counsellorNotes && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 78, 59, 0.15) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34D399',
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={20} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#34D399', textTransform: 'uppercase' }}>
                Counsellor Review & Strategy Advisory
              </span>
              <span
                style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#6EE7B7',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '10px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                }}
              >
                {batch.status === 'COUNSELLOR_APPROVED' ? 'Approved Strategy' : batch.status}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.925rem', color: '#D1FAE5', lineHeight: 1.5 }}>
              {batch.counsellorNotes}
            </p>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('ALL')}
          style={{
            background: activeTab === 'ALL' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            border: `1px solid ${activeTab === 'ALL' ? '#6366F1' : 'transparent'}`,
            color: activeTab === 'ALL' ? '#FFFFFF' : '#94A3B8',
            padding: '0.5rem 1rem',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          All Recommendations ({batch?.items.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('SAFE')}
          style={{
            background: activeTab === 'SAFE' ? 'rgba(34, 197, 94, 0.2)' : 'transparent',
            border: `1px solid ${activeTab === 'SAFE' ? '#22C55E' : 'transparent'}`,
            color: activeTab === 'SAFE' ? '#4ADE80' : '#94A3B8',
            padding: '0.5rem 1rem',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Safe ({batch?.counts.safe || 0})
        </button>

        <button
          onClick={() => setActiveTab('BEST_FIT')}
          style={{
            background: activeTab === 'BEST_FIT' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            border: `1px solid ${activeTab === 'BEST_FIT' ? '#6366F1' : 'transparent'}`,
            color: activeTab === 'BEST_FIT' ? '#A5B4FC' : '#94A3B8',
            padding: '0.5rem 1rem',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Best-Fit ({batch?.counts.bestFit || 0})
        </button>

        <button
          onClick={() => setActiveTab('ASPIRATIONAL')}
          style={{
            background: activeTab === 'ASPIRATIONAL' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
            border: `1px solid ${activeTab === 'ASPIRATIONAL' ? '#F59E0B' : 'transparent'}`,
            color: activeTab === 'ASPIRATIONAL' ? '#FCD34D' : '#94A3B8',
            padding: '0.5rem 1rem',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Aspirational ({batch?.counts.aspirational || 0})
        </button>

        <button
          onClick={() => setActiveTab('ALTERNATIVES')}
          style={{
            background: activeTab === 'ALTERNATIVES' ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
            border: `1px solid ${activeTab === 'ALTERNATIVES' ? '#A855F7' : 'transparent'}`,
            color: activeTab === 'ALTERNATIVES' ? '#D8B4FE' : '#94A3B8',
            padding: '0.5rem 1rem',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Strategic Alternatives ({batch?.counts.alternatives || 0})
        </button>
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94A3B8' }}>
          Evaluating college admission benchmarks and student profile...
        </div>
      ) : visibleItems().length === 0 ? (
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px dashed rgba(255, 255, 255, 0.1)',
            padding: '3.5rem 2rem',
            borderRadius: '16px',
            textAlign: 'center',
          }}
        >
          <Layers size={36} color="#818CF8" style={{ marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF', margin: '0 0 0.5rem 0' }}>
            No Colleges in Selected Category
          </h3>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem', maxWidth: '420px', margin: '0 auto' }}>
            Try selecting a different filter tab or click "Regenerate Strategy" to refresh benchmark evaluations.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {visibleItems().map((item) => (
            <RecommendationCard
              key={item.id}
              item={item}
              onOpenEvidence={(it) => setSelectedItemForEvidence(it)}
              onOpenScatterPlot={(it) => setSelectedItemForScatter(it)}
              onToggleShortlist={handleToggleShortlist}
              isShortlistLoading={shortlistLoadingId === item.id}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <EvidenceModal
        isOpen={!!selectedItemForEvidence}
        onClose={() => setSelectedItemForEvidence(null)}
        item={selectedItemForEvidence}
        onToggleShortlist={handleToggleShortlist}
      />

      <CohortScatterPlotModal
        isOpen={!!selectedItemForScatter}
        onClose={() => setSelectedItemForScatter(null)}
        item={selectedItemForScatter}
      />
    </div>
  );
};

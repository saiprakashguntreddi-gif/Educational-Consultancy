import React, { useState, useEffect, useCallback } from 'react';
import {
  IdCard,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  X,
} from 'lucide-react';
import { PersonalService } from '../services/personal.service';
import {
  PersonalModuleData,
  UpdateContactGuardianInput,
  CreateActivityInput,
  UpdateActivityInput,
  CreateAchievementInput,
  UpdateAchievementInput,
} from '../personal.types';
import { ContactGuardianSection } from './ContactGuardianSection';
import { ActivitiesSection } from './ActivitiesSection';
import { AchievementsSection } from './AchievementsSection';

interface PersonalInformationViewProps {
  onBackToDashboard?: () => void;
}

export const PersonalInformationView: React.FC<PersonalInformationViewProps> = ({
  onBackToDashboard,
}) => {
  const [data, setData] = useState<PersonalModuleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Auto-dismiss success feedback after 5 seconds
  useEffect(() => {
    if (feedback?.type === 'success') {
      const timer = setTimeout(() => {
        setFeedback(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Load authenticated student's personal information
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const res = await PersonalService.getMyPersonal();
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setFeedback({
          type: 'error',
          message: res.message || 'Failed to retrieve personal information.',
        });
      }
    } catch (err: any) {
      console.error('Failed to load personal info:', err);
      setFeedback({
        type: 'error',
        message: err.message || 'An error occurred while loading personal information.',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handler: Update Contact & Guardian
  const handleSaveContactGuardian = async (
    payload: UpdateContactGuardianInput
  ): Promise<boolean> => {
    setIsSaving(true);
    try {
      const res = await PersonalService.updateContactGuardian(payload);
      if (res.success && res.data) {
        setData(res.data);
        setFeedback({
          type: 'success',
          message: 'Contact and guardian information updated successfully.',
        });
        return true;
      } else {
        setFeedback({
          type: 'error',
          message: res.message || 'Failed to update contact information.',
        });
        return false;
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'An error occurred while updating contact details.',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Handler: Add Activity
  const handleAddActivity = async (payload: CreateActivityInput): Promise<boolean> => {
    setIsSaving(true);
    try {
      const res = await PersonalService.addActivity(payload);
      if (res.success && res.data) {
        setData((prev) =>
          prev ? { ...prev, activities: [res.data!, ...(prev.activities || [])] } : null
        );
        setFeedback({
          type: 'success',
          message: `Extracurricular activity "${payload.activityName}" recorded.`,
        });
        return true;
      } else {
        setFeedback({
          type: 'error',
          message: res.message || 'Failed to add activity.',
        });
        return false;
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to add extracurricular activity.',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Handler: Update Activity
  const handleUpdateActivity = async (
    id: string,
    payload: UpdateActivityInput
  ): Promise<boolean> => {
    setIsSaving(true);
    try {
      const res = await PersonalService.updateActivity(id, payload);
      if (res.success && res.data) {
        setData((prev) =>
          prev
            ? {
                ...prev,
                activities: prev.activities.map((act) => (act.id === id ? res.data! : act)),
              }
            : null
        );
        setFeedback({
          type: 'success',
          message: 'Extracurricular activity updated successfully.',
        });
        return true;
      } else {
        setFeedback({
          type: 'error',
          message: res.message || 'Failed to update activity.',
        });
        return false;
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to update extracurricular activity.',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Handler: Delete Activity
  const handleDeleteActivity = async (id: string): Promise<boolean> => {
    try {
      const res = await PersonalService.deleteActivity(id);
      if (res.success) {
        setData((prev) =>
          prev
            ? {
                ...prev,
                activities: prev.activities.filter((act) => act.id !== id),
              }
            : null
        );
        setFeedback({
          type: 'success',
          message: 'Activity removed successfully.',
        });
        return true;
      } else {
        setFeedback({
          type: 'error',
          message: res.message || 'Failed to delete activity.',
        });
        return false;
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to delete activity.',
      });
      return false;
    }
  };

  // Handler: Add Achievement
  const handleAddAchievement = async (payload: CreateAchievementInput): Promise<boolean> => {
    setIsSaving(true);
    try {
      const res = await PersonalService.addAchievement(payload);
      if (res.success && res.data) {
        setData((prev) =>
          prev
            ? {
                ...prev,
                achievements: [res.data!, ...(prev.achievements || [])],
              }
            : null
        );
        setFeedback({
          type: 'success',
          message: `Achievement "${payload.title}" recorded successfully.`,
        });
        return true;
      } else {
        setFeedback({
          type: 'error',
          message: res.message || 'Failed to add achievement.',
        });
        return false;
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to record achievement.',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Handler: Update Achievement
  const handleUpdateAchievement = async (
    id: string,
    payload: UpdateAchievementInput
  ): Promise<boolean> => {
    setIsSaving(true);
    try {
      const res = await PersonalService.updateAchievement(id, payload);
      if (res.success && res.data) {
        setData((prev) =>
          prev
            ? {
                ...prev,
                achievements: prev.achievements.map((ach) => (ach.id === id ? res.data! : ach)),
              }
            : null
        );
        setFeedback({
          type: 'success',
          message: 'Achievement record updated successfully.',
        });
        return true;
      } else {
        setFeedback({
          type: 'error',
          message: res.message || 'Failed to update achievement.',
        });
        return false;
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to update achievement.',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Handler: Delete Achievement
  const handleDeleteAchievement = async (id: string): Promise<boolean> => {
    try {
      const res = await PersonalService.deleteAchievement(id);
      if (res.success) {
        setData((prev) =>
          prev
            ? {
                ...prev,
                achievements: prev.achievements.filter((ach) => ach.id !== id),
              }
            : null
        );
        setFeedback({
          type: 'success',
          message: 'Achievement removed successfully.',
        });
        return true;
      } else {
        setFeedback({
          type: 'error',
          message: res.message || 'Failed to delete achievement.',
        });
        return false;
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to delete achievement.',
      });
      return false;
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div
        id="personal-loading-state"
        style={{
          padding: '5rem 1.5rem',
          textAlign: 'center',
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            border: '3px solid #E2E8F0',
            borderTopColor: '#4F46E5',
            borderRadius: '50%',
            margin: '0 auto 1.25rem',
            animation: 'spin 0.7s linear infinite',
          }}
        />
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.35rem' }}>
          Loading Personal Information...
        </h3>
        <p style={{ fontSize: '0.86rem', color: '#64748B' }}>
          Retrieving contact channels, guardian details, and accomplishments...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div
      id="personal-information-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        maxWidth: '100%',
        width: '100%',
      }}
    >
      {/* PAGE HEADER */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0B1535 0%, #1E1B4B 100%)',
          borderRadius: '18px',
          padding: '2.25rem 2rem',
          color: '#FFFFFF',
          boxShadow: '0 8px 24px rgba(11, 21, 53, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle decorative glow */}
        <div
          style={{
            position: 'absolute',
            right: '-60px',
            top: '-60px',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(109, 40, 217, 0.3) 0%, rgba(109, 40, 217, 0) 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)',
              }}
            >
              <IdCard size={24} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <h1
                  style={{
                    fontSize: '1.65rem',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    margin: 0,
                    color: '#FFFFFF',
                  }}
                >
                  Personal Information
                </h1>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.65rem',
                    borderRadius: '999px',
                    background: 'rgba(255, 255, 255, 0.15)',
                    color: '#E0E7FF',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  Module 5
                </span>
              </div>
              <p
                style={{
                  fontSize: '0.92rem',
                  color: '#C7D2FE',
                  margin: '0.35rem 0 0',
                  lineHeight: 1.45,
                }}
              >
                Keep your contact details, family information and accomplishments up to date.
              </p>
            </div>
          </div>

          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)')}
            >
              <ArrowLeft size={15} />
              <span>Dashboard</span>
            </button>
          )}
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div
          id="personal-feedback-banner"
          style={{
            padding: '1rem 1.25rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            background: feedback.type === 'success' ? '#F0FDF4' : '#FEF2F2',
            border: `1px solid ${feedback.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
            color: feedback.type === 'success' ? '#166534' : '#991B1B',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {feedback.type === 'success' ? (
              <CheckCircle2 size={18} color="#16A34A" />
            ) : (
              <AlertCircle size={18} color="#DC2626" />
            )}
            <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              padding: '0.2rem',
              display: 'flex',
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* SECTION 1 & 2: CONTACT INFORMATION & PARENT / GUARDIAN DETAILS */}
      <ContactGuardianSection
        primaryEmail={data?.primaryEmail || ''}
        primaryPhone={data?.primaryPhone || ''}
        alternateEmail={data?.alternateEmail || null}
        guardian={data?.guardian || { name: null, relationship: null, phone: null, email: null }}
        onSave={handleSaveContactGuardian}
        isSaving={isSaving}
      />

      {/* SECTION 3: EXTRACURRICULAR ACTIVITIES */}
      <ActivitiesSection
        activities={data?.activities || []}
        onAddActivity={handleAddActivity}
        onUpdateActivity={handleUpdateActivity}
        onDeleteActivity={handleDeleteActivity}
        isSaving={isSaving}
      />

      {/* SECTION 4: ACHIEVEMENTS & RECOGNITIONS */}
      <AchievementsSection
        achievements={data?.achievements || []}
        onAddAchievement={handleAddAchievement}
        onUpdateAchievement={handleUpdateAchievement}
        onDeleteAchievement={handleDeleteAchievement}
        isSaving={isSaving}
      />
    </div>
  );
};

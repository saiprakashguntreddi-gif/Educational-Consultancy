import React, { useState } from 'react';
import {
  X,
  Plus,
  BookOpen,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { InstitutionDetail, CourseSummary, AdminCreateCourseInput } from '../colleges.types';
import { CollegesService } from '../services/colleges.service';
import { AdminCourseModal } from './AdminCourseModal';

interface AdminCoursesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  institution: InstitutionDetail | null;
  onRefreshInstitution: (id: string) => Promise<void>;
  showToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminCoursesDrawer: React.FC<AdminCoursesDrawerProps> = ({
  isOpen,
  onClose,
  institution,
  onRefreshInstitution,
  showToast,
}) => {
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<CourseSummary | null>(null);
  const [isSavingCourse, setIsSavingCourse] = useState(false);

  if (!isOpen || !institution) return null;

  const handleOpenAddCourse = () => {
    setCourseToEdit(null);
    setIsCourseModalOpen(true);
  };

  const handleOpenEditCourse = (course: CourseSummary) => {
    setCourseToEdit(course);
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = async (data: AdminCreateCourseInput): Promise<boolean> => {
    setIsSavingCourse(true);
    try {
      if (courseToEdit) {
        const res = await CollegesService.adminUpdateCourse(courseToEdit.id, data);
        if (res.success) {
          showToast(`Course program "${data.name}" updated successfully.`, 'success');
          await onRefreshInstitution(institution.id);
          return true;
        } else {
          showToast(String(res.error || 'Failed to update course'), 'error');
          return false;
        }
      } else {
        const res = await CollegesService.adminCreateCourse(institution.id, data);
        if (res.success) {
          showToast(`Course program "${data.name}" added to catalogue.`, 'success');
          await onRefreshInstitution(institution.id);
          return true;
        } else {
          showToast(String(res.error || 'Failed to create course'), 'error');
          return false;
        }
      }
    } catch (_err) {
      showToast('Error saving course program', 'error');
      return false;
    } finally {
      setIsSavingCourse(false);
    }
  };

  const handleToggleCoursePublish = async (course: CourseSummary) => {
    const newPublish = !course.isPublished;
    try {
      const res = await CollegesService.adminSetCoursePublishStatus(course.id, newPublish);
      if (res.success) {
        const actionText = newPublish ? 'published' : 'unpublished';
        showToast(`Course "${course.name}" ${actionText}.`, 'info');
        await onRefreshInstitution(institution.id);
      } else {
        showToast(String(res.error || 'Failed to change publish status'), 'error');
      }
    } catch (_err) {
      showToast('Error modifying course publish status', 'error');
    }
  };

  const handleDeleteCourse = async (courseId: string, courseName: string) => {
    if (!window.confirm(`Are you sure you want to remove "${courseName}" from the catalogue?`)) {
      return;
    }

    try {
      const res = await CollegesService.adminDeleteCourse(courseId);
      if (res.success) {
        showToast(`Course "${courseName}" removed.`, 'info');
        await onRefreshInstitution(institution.id);
      } else {
        showToast(String(res.error || 'Failed to delete course'), 'error');
      }
    } catch (_err) {
      showToast('Error deleting course program', 'error');
    }
  };

  const courses = institution.courses || [];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10001,
        background: 'rgba(8, 20, 38, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '780px',
          height: '100%',
          background: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(8, 20, 38, 0.25)',
          borderLeft: '1px solid #EAECF0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            background: 'linear-gradient(135deg, #081426 0%, #172033 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #EAECF0',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span
                style={{
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  background: 'rgba(91, 79, 233, 0.3)',
                  color: '#C7D2FE',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                Catalogue Course Manager
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{courses.length} Programs Listed</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#FFFFFF' }}>
              {institution.name}
            </h3>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '8px',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Toolbar */}
        <div
          style={{
            padding: '1rem 1.75rem',
            background: '#F8FAFC',
            borderBottom: '1px solid #EAECF0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>
            Only <strong>PUBLISHED</strong> programs appear on the Student Discovery page.
          </div>

          <button
            onClick={handleOpenAddCourse}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              background: '#5B4FE9',
              color: '#FFFFFF',
              fontSize: '0.8125rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(91, 79, 233, 0.25)',
            }}
          >
            <Plus size={15} />
            + Add Program
          </button>
        </div>

        {/* Courses List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {courses.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '4rem 1rem',
                color: '#64748B',
                background: '#F8FAFC',
                borderRadius: '12px',
                border: '1px dashed #CBD5E1',
              }}
            >
              <BookOpen size={36} color="#94A3B8" style={{ margin: '0 auto 0.75rem auto' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#1E293B', margin: '0 0 0.25rem 0' }}>
                No courses added yet
              </h4>
              <p style={{ fontSize: '0.8125rem', margin: '0 0 1rem 0' }}>
                Click "+ Add Program" above to attach degree courses, requirements, and fee details to this college.
              </p>
              <button
                onClick={handleOpenAddCourse}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  background: '#5B4FE9',
                  color: '#FFFFFF',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                + Add First Program
              </button>
            </div>
          ) : (
            courses.map((course) => (
              <div
                key={course.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #EAECF0',
                  padding: '1.25rem',
                  boxShadow: '0 1px 3px rgba(16, 24, 40, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span
                        style={{
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          background: '#EEF2FF',
                          color: '#4338CA',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      >
                        {course.level}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                        {course.department}
                      </span>
                      {course.isPopular && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            background: '#FEF3C7',
                            color: '#92400E',
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                          }}
                        >
                          <Sparkles size={11} /> Popular
                        </span>
                      )}
                      <span
                        style={{
                          padding: '0.15rem 0.5rem',
                          borderRadius: '10px',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          background: course.isPublished ? '#DCFCE7' : '#FEF3C7',
                          color: course.isPublished ? '#166534' : '#92400E',
                        }}
                      >
                        {course.isPublished ? 'PUBLISHED' : 'DRAFT'}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#081426', margin: '0 0 0.35rem 0' }}>
                      {course.name}
                    </h4>

                    {course.specialization && (
                      <div style={{ fontSize: '0.8125rem', color: '#4F46E5', fontWeight: 500, marginBottom: '0.35rem' }}>
                        Track: {course.specialization}
                      </div>
                    )}

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem', fontSize: '0.75rem', color: '#64748B' }}>
                      {course.durationText && <span>Duration: {course.durationText}</span>}
                      {course.feeRange ? (
                        <span style={{ fontWeight: 600, color: '#081426' }}>Fee: {course.feeRange}</span>
                      ) : course.annualTuitionFee ? (
                        <span style={{ fontWeight: 600, color: '#081426' }}>
                          Fee: {course.feeCurrency || '$'}{course.annualTuitionFee.toLocaleString()}/yr
                        </span>
                      ) : null}
                      {course.scholarshipAvailable && (
                        <span style={{ color: '#059669', fontWeight: 600 }}>✓ Scholarship Available</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <button
                      onClick={() => handleToggleCoursePublish(course)}
                      style={{
                        background: course.isPublished ? '#F1F5F9' : '#DCFCE7',
                        color: course.isPublished ? '#475569' : '#166534',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.4rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title={course.isPublished ? 'Unpublish program' : 'Publish program to students'}
                    >
                      {course.isPublished ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>

                    <button
                      onClick={() => handleOpenEditCourse(course)}
                      style={{
                        background: '#EEF2FF',
                        color: '#4338CA',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.4rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Edit course program"
                    >
                      <Edit2 size={15} />
                    </button>

                    <button
                      onClick={() => handleDeleteCourse(course.id, course.name)}
                      style={{
                        background: '#FEF2F2',
                        color: '#DC2626',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.4rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Delete course from catalogue"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Course Add/Edit Modal */}
        <AdminCourseModal
          isOpen={isCourseModalOpen}
          onClose={() => setIsCourseModalOpen(false)}
          institutionName={institution.name}
          courseToEdit={courseToEdit}
          onSave={handleSaveCourse}
          isSaving={isSavingCourse}
        />
      </div>
    </div>
  );
};

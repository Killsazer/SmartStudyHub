import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { getSubjects, SubjectItem, createSubject, updateSubject, deleteSubject } from '../features/subjects/api/subjects.api';
import { getTeachers, getScheduleSlots, deleteScheduleSlot, Teacher, ScheduleSlot } from '../features/schedule/api/schedule.api';
import { getTasks } from '../features/tasks/api/tasks.api';
import { useConfirm } from '../shared/components/ConfirmDialog';

import { ScheduleGrid } from '../features/schedule/components/ScheduleGrid';
import { TeacherManager } from '../features/schedule/components/TeacherManager';
import { CreateSlotModal } from '../features/schedule/components/CreateSlotModal';
import { CreateSubjectModal } from '../features/subjects/components/CreateSubjectModal';
import { WelcomeModal } from '../features/onboarding/components/WelcomeModal';
import { DashboardHeader } from '../features/dashboard/components/DashboardHeader';
import { SubjectsManagementModal } from '../features/dashboard/components/SubjectsManagementModal';

const DashboardPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const confirm = useConfirm();

  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeWeek, setActiveWeek] = useState<1 | 2>(1);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const [isTeacherManagerOpen, setIsTeacherManagerOpen] = useState(false);
  const [isSubjectsModalOpen, setIsSubjectsModalOpen] = useState(false);

  const [isCreateSubjectOpen, setIsCreateSubjectOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null);

  const [isCreateSlotOpen, setIsCreateSlotOpen] = useState(false);
  const [newSlotData, setNewSlotData] = useState<{ day: number; timeIndex: number } | undefined>();
  const [editingSlotState, setEditingSlotState] = useState<ScheduleSlot | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeWeek]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subs, tchs, slts, allTasks] = await Promise.all([
        getSubjects(),
        getTeachers(),
        getScheduleSlots(activeWeek),
        getTasks(),
      ]);

      const subjectsWithTasks = subs.map(sub => ({
        ...sub,
        tasks: allTasks.filter(task => task.subjectId === sub.id),
      }));

      setSubjects(subjectsWithTasks);
      setTeachers(tchs);
      setSlots(slts);

      if (subs.length === 0 && tchs.length === 0 && slts.length === 0) {
        setShowWelcomeModal(true);
      }
    } catch {
      toast.error(t('failed_to_load_dashboard'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (data: { title: string; color: string }) => {
    try {
      if (editingSubject) {
        await updateSubject(editingSubject.id, data);
        toast.success(t('subject_updated'));
      } else {
        await createSubject(data);
        toast.success(t('subject_created'));
      }
      fetchData();
    } catch {
      toast.error(t('failed_to_save_subject'));
    }
  };

  const handleDeleteSubject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const ok = await confirm({ message: t('delete_subject_confirm'), tone: 'danger' });
    if (!ok) return;
    try {
      await deleteSubject(id);
      toast.success(t('subject_deleted'));
      fetchData();
    } catch {
      toast.error(t('failed_to_delete_subject'));
    }
  };

  const handleDeleteSlot = async (slot: ScheduleSlot) => {
    const ok = await confirm({ message: t('delete_lesson_confirm'), tone: 'danger' });
    if (!ok) return;
    try {
      await deleteScheduleSlot(slot.id);
      toast.success(t('deleted_successfully'));
      fetchData();
    } catch {
      toast.error(t('error'));
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-200">
      <DashboardHeader
        onOpenTeachers={() => setIsTeacherManagerOpen(true)}
        onOpenSubjects={() => setIsSubjectsModalOpen(true)}
        onImportComplete={fetchData}
      />

      <main className="max-w-[1400px] mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            {t('my_schedule')}
            {loading && <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />}
          </h1>

          <div className="flex bg-zinc-200/50 dark:bg-zinc-900 p-1 rounded-xl">
            <button
              onClick={() => setActiveWeek(1)}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeWeek === 1 ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
            >
              {t('week_1')}
            </button>
            <button
              onClick={() => setActiveWeek(2)}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeWeek === 2 ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
            >
              {t('week_2')}
            </button>
          </div>
        </div>

        <ScheduleGrid
          weekNumber={activeWeek}
          slots={slots}
          subjects={subjects}
          teachers={teachers}
          onSlotClick={(slot) => {
            if (!slot.subjectId) return;
            const subject = subjects.find(s => s.id === slot.subjectId);
            const teacher = teachers.find(tch => tch.id === slot.teacherId);
            navigate(`/subjects/${slot.subjectId}`, { state: { slot, teacher, subject } });
          }}
          onEmptySlotClick={(day, timeIndex) => {
            setNewSlotData({ day, timeIndex });
            setIsCreateSlotOpen(true);
          }}
          onEditSlot={(slot) => {
            setEditingSlotState(slot);
            setIsCreateSlotOpen(true);
          }}
          onDeleteSlot={handleDeleteSlot}
        />
      </main>

      <TeacherManager
        isOpen={isTeacherManagerOpen}
        onClose={() => setIsTeacherManagerOpen(false)}
        teachers={teachers}
        onTeachersChange={fetchData}
      />

      <CreateSlotModal
        isOpen={isCreateSlotOpen}
        onClose={() => {
          setIsCreateSlotOpen(false);
          setEditingSlotState(null);
        }}
        subjects={subjects}
        teachers={teachers}
        weekNumber={activeWeek}
        initialDay={newSlotData?.day}
        initialTimeIndex={newSlotData?.timeIndex}
        initialData={editingSlotState || undefined}
        onCreated={fetchData}
      />

      <SubjectsManagementModal
        isOpen={isSubjectsModalOpen}
        onClose={() => setIsSubjectsModalOpen(false)}
        subjects={subjects}
        onAddNew={() => { setEditingSubject(null); setIsCreateSubjectOpen(true); }}
        onEditSubject={(subj) => { setEditingSubject(subj); setIsCreateSubjectOpen(true); }}
        onDeleteSubject={handleDeleteSubject}
        onSubjectClick={(id) => navigate(`/subjects/${id}`)}
        onDataChanged={fetchData}
      />

      <CreateSubjectModal
        isOpen={isCreateSubjectOpen}
        onClose={() => setIsCreateSubjectOpen(false)}
        onSubmit={handleCreateSubject}
        initialData={editingSubject}
      />

      <WelcomeModal
        isOpen={showWelcomeModal}
        onComplete={(dataGenerated) => {
          setShowWelcomeModal(false);
          if (dataGenerated) {
            fetchData();
          }
        }}
      />
    </div>
  );
};

export default DashboardPage;

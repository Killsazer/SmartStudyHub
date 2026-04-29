import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { LogOut, Users, FolderOpen, CalendarDays, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../features/auth/AuthContext';
import { getSubjects, SubjectItem } from '../features/subjects/api/subjects.api';
import { getTeachers, getScheduleSlots, deleteScheduleSlot, Teacher, ScheduleSlot } from '../features/schedule/api/schedule.api';
import { useTranslation } from 'react-i18next';
import { ThemeLangToggle } from '../shared/components/ThemeLangToggle';

import { ScheduleGrid } from '../features/schedule/components/ScheduleGrid';
import { ShareSchedule } from '../features/schedule/components/ShareSchedule';
import { TeacherManager } from '../features/schedule/components/TeacherManager';
import { CreateSlotModal } from '../features/schedule/components/CreateSlotModal';
import { SlotDetailSidebar } from '../features/schedule/components/SlotDetailSidebar';

import { SubjectCard } from '../features/subjects/components/SubjectCard';
import { CreateSubjectModal } from '../features/subjects/components/CreateSubjectModal';
import { createSubject, updateSubject, deleteSubject } from '../features/subjects/api/subjects.api';
import { WelcomeModal } from '../features/onboarding/components/WelcomeModal';

const DashboardPage = () => {
  const { t } = useTranslation();
  const { logout, user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Data State
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeWeek, setActiveWeek] = useState<1 | 2>(1);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Modals & Panels State
  const [isTeacherManagerOpen, setIsTeacherManagerOpen] = useState(false);
  const [isSubjectsModalOpen, setIsSubjectsModalOpen] = useState(false);
  
  // Create Subject State
  const [isCreateSubjectOpen, setIsCreateSubjectOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null);

  // Slot Management State
  const [isCreateSlotOpen, setIsCreateSlotOpen] = useState(false);
  const [newSlotData, setNewSlotData] = useState<{ day: number; timeIndex: number } | undefined>();
  const [editingSlotState, setEditingSlotState] = useState<ScheduleSlot | null>(null);
  
  // Slot Detail Sidebar State
  const [selectedSlot, setSelectedSlot] = useState<ScheduleSlot | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeWeek]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subs, tchs, slts] = await Promise.all([
        getSubjects(),
        getTeachers(),
        getScheduleSlots(activeWeek)
      ]);
      setSubjects(subs);
      setTeachers(tchs);
      setSlots(slts);
      setSelectedSlot(prev => prev ? (slts.find(s => s.id === prev.id) || null) : null);
      
      if (subs.length === 0 && tchs.length === 0 && slts.length === 0) {
        setShowWelcomeModal(true);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // ─── Subjects Management 
  const handleCreateSubject = async (data: { title: string; color: string }) => {
    try {
      if (editingSubject) {
        await updateSubject(editingSubject.id, data);
        toast.success('Subject updated!');
      } else {
        await createSubject(data);
        toast.success('Subject created!');
      }
      fetchData();
    } catch (error) {
      toast.error('Failed to save subject');
    }
  };

  const handleDeleteSubject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Deleting this subject will also delete all its tasks, notes, and schedule slots. Proceed?')) return;
    try {
      await deleteSubject(id);
      toast.success('Subject deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete subject');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-200">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-500/10 p-1.5 rounded-lg">
              <CalendarDays className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            </div>
            <span className="font-semibold text-lg tracking-tight hidden sm:inline-block">Smart Study Hub</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
            <button
              onClick={() => setIsTeacherManagerOpen(true)}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors flex items-center gap-2"
            >
              <Users className="w-4 h-4" /> <span className="hidden sm:inline-block">{t('teachers')}</span>
            </button>
            <button
              onClick={() => setIsSubjectsModalOpen(true)}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors flex items-center gap-2"
            >
              <FolderOpen className="w-4 h-4" /> <span className="hidden sm:inline-block">Предмети</span>
            </button>

            <ShareSchedule onImportComplete={fetchData} />

            <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 hidden md:block"></div>
            
            <div className="hidden md:block">
              <ThemeLangToggle />
            </div>
            
            <div ref={profileRef}>
              <button
                onClick={() => {
                  if (profileRef.current) {
                    const rect = profileRef.current.getBoundingClientRect();
                    setDropdownPosition({
                      top: rect.bottom + 8,
                      right: window.innerWidth - rect.right,
                    });
                  }
                  setIsProfileOpen(!isProfileOpen);
                }}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {user?.firstName?.[0]?.toUpperCase() || '?'}{user?.lastName?.[0]?.toUpperCase() || ''}
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform hidden sm:block ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {isProfileOpen && createPortal(
              <div 
                className="fixed z-[100]" 
                style={{
                  top: dropdownPosition.top,
                  right: dropdownPosition.right,
                }}
              >
                <div className="w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
                  <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold shrink-0">
                        {user?.firstName?.[0]?.toUpperCase() || '?'}{user?.lastName?.[0]?.toUpperCase() || ''}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-900 dark:text-white truncate">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => { setIsProfileOpen(false); logout(); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('sign_out')}
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )}
          </div>
        </div>
      </header>

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
          onSlotClick={(slot) => setSelectedSlot(slot)}
          onEmptySlotClick={(day, timeIndex) => {
            setNewSlotData({ day, timeIndex });
            setIsCreateSlotOpen(true);
          }}
        />
      </main>

      {/* Modals & Overlays */}
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
        onCreated={() => {
          fetchData();
          if (editingSlotState && selectedSlot?.id === editingSlotState.id) {
            // Optionally close sidebar entirely, or refetch
            // setSelectedSlot(null);
          }
        }}
      />

      {selectedSlot && (
        <SlotDetailSidebar 
          slot={selectedSlot}
          subject={subjects.find(s => s.id === selectedSlot.subjectId)}
          teacher={teachers.find(t => t.id === selectedSlot.teacherId)}
          onEditSlot={() => {
            setEditingSlotState(selectedSlot);
            setIsCreateSlotOpen(true);
          }}
          onDeleteSlot={async () => {
            if (!window.confirm(t('delete_lesson_confirm', 'Ви дійсно хочете видалити це заняття з розкладу?'))) return;
            try {
                await deleteScheduleSlot(selectedSlot.id);
                toast.success(t('deleted_successfully', 'Успішно видалено'));
                setSelectedSlot(null);
                fetchData();
            } catch (err) {
                toast.error(t('error', 'Сталася помилка'));
            }
          }}
          onClose={() => setSelectedSlot(null)}
        />
      )}

      {/* Management subjects modal overlay */}
      {isSubjectsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-5xl h-[85vh] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FolderOpen className="w-6 h-6 text-indigo-500" /> Управління предметами
              </h2>
              <button onClick={() => setIsSubjectsModalOpen(false)} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => { setEditingSubject(null); setIsCreateSubjectOpen(true); }}
                  className="bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-600 transition-colors"
                >
                  {t('new_subject')}
                </button>
              </div>

              {subjects.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">Немає створених предметів.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subjects.map(subj => (
                    <SubjectCard
                      key={subj.id}
                      subject={subj}
                      onClick={() => {}} // Disabled navigation, manageable only
                      onEdit={(e) => { e.stopPropagation(); setEditingSubject(subj); setIsCreateSubjectOpen(true); }}
                      onDelete={(e) => handleDeleteSubject(e, subj.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <CreateSubjectModal
        isOpen={isCreateSubjectOpen}
        onClose={() => setIsCreateSubjectOpen(false)}
        onSubmit={handleCreateSubject}
        initialData={editingSubject}
      />

      <WelcomeModal
        isOpen={showWelcomeModal}
        onComplete={() => {
          setShowWelcomeModal(false);
          fetchData();
        }}
      />
    </div>
  );
};

export default DashboardPage;

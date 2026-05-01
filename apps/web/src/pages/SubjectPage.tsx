import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Clock, MapPin, List, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskItem as TaskComponent } from '../features/tasks/components/TaskItem';
import { TaskBoard } from '../features/tasks/components/TaskBoard';
import { TaskSortDropdown } from '../features/tasks/components/TaskSortDropdown';
import { CreateTaskModal } from '../features/tasks/components/CreateTaskModal';
import { getTasks, deleteTask, Task, SortStrategy } from '../features/tasks/api/tasks.api';
import toast from 'react-hot-toast';


import { getNoteTree, deleteNote, NoteComponent } from '../features/notes/api/notes.api';
import { NoteTree } from '../features/notes/components/NoteTree';
import { CreateNoteModal } from '../features/notes/components/CreateNoteModal';
import { useTranslation } from 'react-i18next';
import { ThemeLangToggle } from '../shared/components/ThemeLangToggle';
import { LinkifyText } from '../shared/components/LinkifyText';
import { useConfirm } from '../shared/components/ConfirmDialog';
import { ScheduleSlot, Teacher } from '../features/schedule/api/schedule.api';
import { SubjectItem } from '../features/subjects/api/subjects.api';
import { useDelayedFlag } from '../shared/hooks/useDelayedFlag';
import { STORAGE_KEYS } from '../shared/storage-keys';

type TaskViewMode = 'list' | 'board';

type SlotContextState = {
  slot?: ScheduleSlot;
  teacher?: Teacher;
  subject?: SubjectItem;
};

const taskListVariants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

const PAGE_EASE = [0.22, 1, 0.36, 1] as const;

const sectionEnter = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.42, ease: PAGE_EASE, delay },
});

const TaskSkeletonRow = () => (
  <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-900/40 flex items-center gap-4">
    <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800" />
    <div className="flex-1 space-y-2">
      <div className="h-3 rounded-full bg-zinc-200 dark:bg-zinc-800 w-3/5" />
      <div className="h-2.5 rounded-full bg-zinc-200/70 dark:bg-zinc-800/70 w-2/5" />
      <div className="flex gap-2 pt-1">
        <div className="h-4 w-14 rounded-full bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-20 rounded-full bg-zinc-200/70 dark:bg-zinc-800/70" />
      </div>
    </div>
  </div>
);

const NoteSkeletonRow = ({ width }: { width: string }) => (
  <div className="flex items-center gap-2 py-2 px-3">
    <div className="w-4 h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
    <div className="w-4 h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
    <div className={`h-3 rounded-full bg-zinc-200 dark:bg-zinc-800 ${width}`} />
  </div>
);

const SubjectPage = () => {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const slotContext = (location.state ?? null) as SlotContextState | null;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<NoteComponent[]>([]);
  const [sortStrategy, setSortStrategy] = useState<SortStrategy>('deadline');
  const [viewMode, setViewMode] = useState<TaskViewMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.TASK_VIEW_MODE);
    return stored === 'board' ? 'board' : 'list';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASK_VIEW_MODE, viewMode);
  }, [viewMode]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteComponent | null>(null);
  const [activeParentNoteId, setActiveParentNoteId] = useState<string | undefined>();
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(true);

  const showTasksSkeleton = useDelayedFlag(loadingTasks && tasks.length === 0);
  const showNotesSkeleton = useDelayedFlag(loadingNotes && notes.length === 0);

  const tasksRequestIdRef = useRef(0);
  const notesRequestIdRef = useRef(0);

  useEffect(() => {
    if (id) {
      fetchTasks();
      fetchNotes();
    }
  }, [id, sortStrategy]);

  const fetchTasks = async () => {
    const myRequestId = ++tasksRequestIdRef.current;
    setLoadingTasks(true);
    try {
      const data = await getTasks(id!, sortStrategy);
      if (myRequestId !== tasksRequestIdRef.current) return;
      setTasks(data);
    } catch (err) {
      if (myRequestId !== tasksRequestIdRef.current) return;
      toast.error(t('failed_to_load_tasks'));
    } finally {
      if (myRequestId === tasksRequestIdRef.current) setLoadingTasks(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const ok = await confirm({ message: t('delete_task_confirm'), tone: 'danger' });
    if (!ok) return;
    try {
      await deleteTask(taskId);
      toast.success(t('task_deleted'));
      fetchTasks();
    } catch (err) {
      toast.error(t('failed_to_delete_task'));
    }
  };

  const handleOpenTaskCreate = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenTaskEdit = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const fetchNotes = async () => {
    const myRequestId = ++notesRequestIdRef.current;
    setLoadingNotes(true);
    try {
      const data = await getNoteTree();
      if (myRequestId !== notesRequestIdRef.current) return;
      setNotes(data.filter(n => n.subjectId === id));
    } catch (err) {
      if (myRequestId !== notesRequestIdRef.current) return;
      toast.error(t('failed_to_load_notes'));
    } finally {
      if (myRequestId === notesRequestIdRef.current) setLoadingNotes(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    const ok = await confirm({ message: t('delete_note_confirm'), tone: 'danger' });
    if (!ok) return;
    try {
      await deleteNote(noteId);
      toast.success(t('deleted_successfully'));
      fetchNotes();
    } catch (err) {
      toast.error(t('failed_to_delete_note'));
    }
  };

  const handleOpenNoteModal = (parentId?: string) => {
    setEditingNote(null);
    setActiveParentNoteId(parentId);
    setIsNoteModalOpen(true);
  };

  const handleEditNote = (note: NoteComponent) => {
    setEditingNote(note);
    setIsNoteModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-200">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold text-lg tracking-tight">{t('back_to_dashboard')}</span>
          </Link>
          <ThemeLangToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {slotContext?.slot && (
          <motion.section
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, ease: PAGE_EASE, delay: 0 }}
            className="relative mb-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm"
            style={{ backgroundColor: slotContext.subject?.color ? `${slotContext.subject.color}15` : undefined }}
          >
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
              style={{ backgroundColor: slotContext.subject?.color || '#3b82f6', transformOrigin: 'top' }}
              className="absolute top-0 left-0 w-1.5 h-full"
            />
            <div className="p-5 sm:p-6 pl-7 sm:pl-8 flex flex-col md:flex-row md:items-start md:justify-between gap-5">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-zinc-900 dark:bg-white text-white dark:text-zinc-900">
                    {t(slotContext.slot.classType.toLowerCase())}
                  </span>
                  <span className="text-sm font-medium text-zinc-500 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {t('day')} {slotContext.slot.dayOfWeek}, {slotContext.slot.startTime} – {slotContext.slot.endTime}
                  </span>
                </div>
                {slotContext.subject?.title && (
                  <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white break-words">
                    {slotContext.subject.title}
                  </h2>
                )}
                {slotContext.slot.location && (
                  <div className="flex items-start gap-1.5 mt-2 text-sm text-zinc-500 break-all whitespace-pre-wrap">
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                    <LinkifyText text={slotContext.slot.location} />
                  </div>
                )}
              </div>

              {slotContext.teacher && (
                <motion.div
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.32, delay: 0.08, ease: [0.22, 1, 0.36, 1] as const }}
                  className="flex items-start gap-3 bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800/50 shadow-sm md:max-w-sm md:shrink-0 transition-shadow hover:shadow-md"
                >
                  <img
                    src={slotContext.teacher.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(slotContext.teacher.name)}&background=6366f1&color=fff`}
                    alt={slotContext.teacher.name}
                    className="w-10 h-10 shrink-0 rounded-full border border-zinc-200 dark:border-zinc-800"
                  />
                  <div className="overflow-hidden">
                    <h4 className="font-semibold text-sm text-zinc-900 dark:text-white break-words">{slotContext.teacher.name}</h4>
                    {slotContext.teacher.contacts && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 whitespace-pre-wrap break-all">
                        <LinkifyText text={slotContext.teacher.contacts} />
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.section>
        )}

        <div className={`grid gap-8 ${viewMode === 'board' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>

        {/* TASKS COLUMN */}
        <motion.section {...sectionEnter(0.1)}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight">{t('active_tasks')}</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/60" role="radiogroup" aria-label={t('view_list')}>
                <button
                  role="radio"
                  aria-checked={viewMode === 'list'}
                  onClick={() => setViewMode('list')}
                  title={t('view_list')}
                  className={`p-1.5 rounded-md transition-all duration-150 active:scale-90 ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  role="radio"
                  aria-checked={viewMode === 'board'}
                  onClick={() => setViewMode('board')}
                  title={t('view_board')}
                  className={`p-1.5 rounded-md transition-all duration-150 active:scale-90 ${
                    viewMode === 'board'
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
              <TaskSortDropdown value={sortStrategy} onChange={setSortStrategy} />
              <button
                onClick={handleOpenTaskCreate}
                className="bg-zinc-200 hover:bg-zinc-300 text-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-white p-2 rounded-lg transition-all duration-150 active:scale-90 hover:shadow-sm"
                title={t('create_task')}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            {tasks.length > 0 && viewMode === 'board' ? (
              <motion.div
                key="tasks-board"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.18 } }}
                transition={{ duration: 0.28, ease: PAGE_EASE }}
              >
                <TaskBoard
                  tasks={tasks}
                  onStatusChanged={fetchTasks}
                  onEdit={handleOpenTaskEdit}
                  onDelete={handleDeleteTask}
                />
              </motion.div>
            ) : tasks.length > 0 ? (
              <motion.div
                key="tasks-list"
                variants={taskListVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, transition: { duration: 0.18 } }}
                className="flex flex-col gap-3"
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {tasks.map((task) => (
                    <TaskComponent
                      key={task.id}
                      task={task}
                      onStatusChanged={fetchTasks}
                      onEdit={() => handleOpenTaskEdit(task)}
                      onDelete={() => handleDeleteTask(task.id)}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : showTasksSkeleton ? (
              <motion.div
                key="tasks-skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: PAGE_EASE }}
                className="flex flex-col gap-3 animate-pulse"
              >
                {[0, 1, 2].map((i) => (
                  <TaskSkeletonRow key={i} />
                ))}
              </motion.div>
            ) : loadingTasks ? (
              <motion.div
                key="tasks-grace"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                className="min-h-[8rem]"
                aria-hidden
              />
            ) : (
              <motion.div
                key="tasks-empty"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.28, ease: PAGE_EASE }}
                className="p-8 border border-zinc-300 dark:border-zinc-800 border-dashed rounded-xl text-center text-zinc-500"
              >
                {t('no_tasks')}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* NOTES COLUMN */}
        <motion.section {...sectionEnter(0.15)}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight">{t('notes_handouts')}</h2>
            <button
              onClick={() => handleOpenNoteModal()}
              className="bg-zinc-200 hover:bg-zinc-300 text-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-white p-2 rounded-lg transition-all duration-150 active:scale-90 hover:shadow-sm"
              title={t('create_root_note')}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {notes.length > 0 || !loadingNotes ? (
              <motion.div
                key="notes-list"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.28, ease: PAGE_EASE }}
              >
                <NoteTree
                  data={notes}
                  subjectId={id!}
                  onAddNote={handleOpenNoteModal}
                  onEditNote={handleEditNote}
                  onDeleteNote={handleDeleteNote}
                />
              </motion.div>
            ) : showNotesSkeleton ? (
              <motion.div
                key="notes-skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: PAGE_EASE }}
                className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 animate-pulse"
              >
                <NoteSkeletonRow width="w-2/5" />
                <NoteSkeletonRow width="w-1/3" />
                <NoteSkeletonRow width="w-1/2" />
                <NoteSkeletonRow width="w-1/4" />
              </motion.div>
            ) : (
              <motion.div
                key="notes-grace"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                className="min-h-[8rem]"
                aria-hidden
              />
            )}
          </AnimatePresence>
        </motion.section>
        </div>

      </main>

      {/* MODALS */}
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        subjectId={id!}
        onCreated={fetchTasks}
        initialData={editingTask}
      />
      <CreateNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setEditingNote(null);
        }}
        subjectId={id!}
        parentId={activeParentNoteId}
        onCreated={fetchNotes}
        initialData={editingNote}
      />
    </div>
  );
};

export default SubjectPage;

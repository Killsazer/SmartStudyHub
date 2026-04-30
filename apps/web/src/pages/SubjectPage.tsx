import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Clock, MapPin } from 'lucide-react';
import { TaskItem as TaskComponent } from '../features/tasks/components/TaskItem';
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
import { ScheduleSlot, Teacher } from '../features/schedule/api/schedule.api';
import { SubjectItem } from '../features/subjects/api/subjects.api';

type SlotContextState = {
  slot?: ScheduleSlot;
  teacher?: Teacher;
  subject?: SubjectItem;
};

const SubjectPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const slotContext = (location.state ?? null) as SlotContextState | null;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<NoteComponent[]>([]);
  const [sortStrategy, setSortStrategy] = useState<SortStrategy>('deadline');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteComponent | null>(null);
  const [activeParentNoteId, setActiveParentNoteId] = useState<string | undefined>();
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(true);

  useEffect(() => {
    if (id) {
      fetchTasks();
      fetchNotes();
    }
  }, [id, sortStrategy]);

  const fetchTasks = async () => {
    try {
      const data = await getTasks(id!, sortStrategy);
      setTasks(data);
    } catch (err) {
      toast.error(t('failed_to_load_tasks'));
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm(t('delete_task_confirm'))) return;
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
    try {
      const data = await getNoteTree();
      // Only show notes related to this subject (top level components)
      const subjectNotes = data.filter(n => n.subjectId === id || n.subjectId === null);
      setNotes(subjectNotes);
    } catch (err) {
      toast.error(t('failed_to_load_notes'));
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm(t('delete_note_confirm'))) return;
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
          <section
            className="relative mb-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
            style={{ backgroundColor: slotContext.subject?.color ? `${slotContext.subject.color}15` : undefined }}
          >
            <div
              className="absolute top-0 left-0 w-1.5 h-full"
              style={{ backgroundColor: slotContext.subject?.color || '#3b82f6' }}
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
                <div className="flex items-start gap-3 bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800/50 shadow-sm md:max-w-sm md:shrink-0">
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
                </div>
              )}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* TASKS COLUMN */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight">{t('active_tasks')}</h2>
            <div className="flex items-center gap-4">
              <TaskSortDropdown value={sortStrategy} onChange={setSortStrategy} />
              <button
                onClick={handleOpenTaskCreate}
                className="bg-zinc-200 hover:bg-zinc-300 text-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-white p-2 rounded-lg transition-colors"
                title={t('create_task')}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {loadingTasks ? (
              <div className="animate-pulse flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-zinc-200 dark:bg-zinc-800/50 rounded-xl" />
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <div className="p-8 border border-zinc-300 dark:border-zinc-800 border-dashed rounded-xl text-center text-zinc-500">
                {t('no_tasks')}
              </div>
            ) : (
              tasks.map((task) => (
                <TaskComponent 
                  key={task.id} 
                  task={task} 
                  onStatusChanged={fetchTasks} 
                  onEdit={() => handleOpenTaskEdit(task)}
                  onDelete={() => handleDeleteTask(task.id)}
                />
              ))
            )}
          </div>
        </section>

        {/* NOTES COLUMN */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight">{t('notes_handouts')}</h2>
            <button
              onClick={() => handleOpenNoteModal()}
              className="bg-zinc-200 hover:bg-zinc-300 text-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-white p-2 rounded-lg transition-colors"
              title={t('create_root_note')}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          {loadingNotes ? (
            <div className="animate-pulse h-40 bg-zinc-200 dark:bg-zinc-800/50 rounded-xl" />
          ) : (
            <NoteTree 
              data={notes} 
              subjectId={id!} 
              onAddNote={handleOpenNoteModal}
              onEditNote={handleEditNote}
              onDeleteNote={handleDeleteNote}
            />
          )}
        </section>
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

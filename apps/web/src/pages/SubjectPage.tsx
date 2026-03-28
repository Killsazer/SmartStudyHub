import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
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

const SubjectPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
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
      toast.error('Failed to load tasks');
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(taskId);
      toast.success('Task deleted');
      fetchTasks();
    } catch (err) {
      toast.error('Failed to delete task');
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
      toast.error('Failed to load notes');
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Are you sure you want to delete this note/folder? All contents will be lost.')) return;
    try {
      await deleteNote(noteId);
      toast.success('Deleted successfully');
      fetchNotes();
    } catch (err) {
      toast.error('Failed to delete note');
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

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
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

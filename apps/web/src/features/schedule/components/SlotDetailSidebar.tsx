// File: src/features/schedule/components/SlotDetailSidebar.tsx
import React, { useState, useEffect } from 'react';
import { X, CheckCircle, FileText, MapPin, Clock } from 'lucide-react';
import { ScheduleSlot, Teacher } from '../api/schedule.api';
import { SubjectItem } from '../../subjects/api/subjects.api';
import { useTranslation } from 'react-i18next';
import { LinkifyText } from '../../../shared/components/LinkifyText';
import { NoteTree } from '../../notes/components/NoteTree';
import { CreateNoteModal } from '../../notes/components/CreateNoteModal';
import { getNoteTree, deleteNote, NoteComponent } from '../../notes/api/notes.api';
import { TaskItem as TaskComponent } from '../../tasks/components/TaskItem';
import { TaskSortDropdown } from '../../tasks/components/TaskSortDropdown';
import { CreateTaskModal } from '../../tasks/components/CreateTaskModal';
import { getTasks, deleteTask, Task, SortStrategy } from '../../tasks/api/tasks.api';
import toast from 'react-hot-toast';

interface Props {
  slot: ScheduleSlot | null;
  subject: SubjectItem | undefined;
  teacher: Teacher | undefined;
  onEditSlot: () => void;
  onDeleteSlot: () => void;
  onClose: () => void;
}

export const SlotDetailSidebar: React.FC<Props> = ({ slot, subject, teacher, onEditSlot, onDeleteSlot, onClose }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'tasks' | 'notes'>('tasks');

  // Tasks State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sortStrategy, setSortStrategy] = useState<SortStrategy>('deadline');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Notes State
  const [notes, setNotes] = useState<NoteComponent[]>([]);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteComponent | null>(null);
  const [activeParentNoteId, setActiveParentNoteId] = useState<string | undefined>();
  const [loadingNotes, setLoadingNotes] = useState(false);

  useEffect(() => {
    if (subject) {
      fetchTasks();
      fetchNotes();
    }
  }, [subject, sortStrategy]);

  const fetchTasks = async () => {
    if (!subject) return;
    setLoadingTasks(true);
    try {
      const data = await getTasks(subject.id, sortStrategy);
      setTasks(data);
    } catch {
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
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const fetchNotes = async () => {
    if (!subject) return;
    setLoadingNotes(true);
    try {
      const data = await getNoteTree();
      setNotes(data.filter((n: any) => n.subjectId === subject.id || n.subjectId === null));
    } catch {
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
    } catch {
      toast.error('Failed to delete note');
    }
  };

  if (!slot || !subject) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-40 pointer-events-none transition-opacity" 
      />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white dark:bg-zinc-950 shadow-2xl border-l border-zinc-200 dark:border-zinc-800 flex flex-col transform transition-transform duration-300 pointer-events-auto">
        
        {/* Header Section */}
        <div 
          className="relative px-6 py-8 border-b border-zinc-200 dark:border-zinc-800"
          style={{ backgroundColor: `${subject.color}15` }}
        >
          <div 
            className="absolute top-0 left-0 w-2 h-full"
            style={{ backgroundColor: subject.color || '#3b82f6' }}
          />
          
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button 
              onClick={onEditSlot}
              className="p-2 rounded-lg bg-white/50 dark:bg-black/50 hover:bg-white dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
              title={t('edit', 'Редагувати')}
            >
               {/* Note: I will need to import Edit icon */}
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
            </button>
            <button 
              onClick={onDeleteSlot}
              className="p-2 rounded-lg bg-white/50 dark:bg-black/50 hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-600 dark:text-zinc-400 hover:text-red-500 transition-colors"
              title={t('delete', 'Видалити')}
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
            </button>
            <button 
              onClick={onClose} 
              className="p-2 rounded-lg bg-white/50 dark:bg-black/50 hover:bg-white dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-zinc-900 dark:bg-white text-white dark:text-zinc-900">
              {slot.classType}
            </span>
            <span className="text-sm font-medium text-zinc-500 flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              Day {slot.dayOfWeek}, {slot.startTime} - {slot.endTime}
            </span>
            {slot.location && (
              <span className="text-sm font-medium text-zinc-500 flex items-start gap-1.5 mt-2 break-all whitespace-pre-wrap w-full">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                <LinkifyText text={slot.location} />
              </span>
            )}
          </div>

          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6 pr-12 break-words">
            {subject.title}
          </h2>

          {/* Teacher Profile Card */}
          {teacher && (
            <div className="flex items-start gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/50 shadow-sm w-full">
              <img 
                src={teacher.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&background=6366f1&color=fff`} 
                alt={teacher.name}
                className="w-12 h-12 shrink-0 rounded-full border border-zinc-200 dark:border-zinc-800"
              />
              <div className="overflow-hidden w-full">
                <h4 className="font-semibold text-zinc-900 dark:text-white break-words">{teacher.name}</h4>
                {teacher.contacts && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 whitespace-pre-wrap break-all">
                    <LinkifyText text={teacher.contacts} />
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 px-6 pt-2 bg-zinc-50 dark:bg-zinc-900/50">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'tasks' 
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            {t('active_tasks')}
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'notes' 
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            {t('notes_handouts')}
          </button>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-zinc-950 p-6">
          {activeTab === 'tasks' ? (
            <div className="max-w-3xl mx-auto h-full pl-6 pr-2">
              <div className="flex items-center justify-between mb-6">
                <TaskSortDropdown value={sortStrategy} onChange={setSortStrategy} />
                <button
                  onClick={() => { setEditingTask(null); setIsTaskModalOpen(true); }}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                >
                  +{t('create_task')}
                </button>
              </div>

              {loadingTasks ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2].map(i => <div key={i} className="h-20 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl" />)}
                </div>
              ) : tasks.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-center text-zinc-500 text-sm">
                  {t('no_tasks')}
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map(task => (
                    <TaskComponent 
                      key={task.id} 
                      task={task} 
                      onStatusChanged={fetchTasks} 
                      onEdit={() => { setEditingTask(task); setIsTaskModalOpen(true); }}
                      onDelete={() => handleDeleteTask(task.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-3xl mx-auto h-full relative">
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => { setEditingNote(null); setActiveParentNoteId(undefined); setIsNoteModalOpen(true); }}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                >
                  +{t('create_root_note')}
                </button>
              </div>

              {loadingNotes ? (
                <div className="animate-pulse h-40 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl" />
              ) : (
                <NoteTree 
                  data={notes} 
                  subjectId={subject.id} 
                  onAddNote={(parentId) => { setEditingNote(null); setActiveParentNoteId(parentId); setIsNoteModalOpen(true); }}
                  onEditNote={(n) => { setEditingNote(n); setIsNoteModalOpen(true); }}
                  onDeleteNote={handleDeleteNote}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Internal Modals */}
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => { setIsTaskModalOpen(false); setEditingTask(null); }}
        subjectId={subject.id}
        onCreated={fetchTasks}
        initialData={editingTask}
      />
      
      <CreateNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => { setIsNoteModalOpen(false); setEditingNote(null); }}
        subjectId={subject.id}
        parentId={activeParentNoteId}
        onCreated={fetchNotes}
        initialData={editingNote}
      />
    </>
  );
};

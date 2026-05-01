import React, { useState } from 'react';
import { Calendar, Flag, CheckCircle2, Circle, Clock, Edit2, Trash2, AlertCircle, Repeat } from 'lucide-react';
import { Task, TaskStatus, changeTaskStatus, undoLastAction } from '../api/tasks.api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

let activeCompletionToastId: string | null = null;

interface Props {
  task: Task;
  onStatusChanged: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const PRIORITY_COLORS = {
  LOW: 'text-zinc-500 bg-zinc-500/10',
  MEDIUM: 'text-amber-500 bg-amber-500/10',
  HIGH: 'text-red-500 bg-red-500/10',
};

const STATUS_ORDER: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

const STATUS_ICONS: Record<TaskStatus, typeof Circle> = {
  TODO: Circle,
  IN_PROGRESS: Clock,
  DONE: CheckCircle2,
};

const STATUS_TITLE_KEYS: Record<TaskStatus, string> = {
  TODO: 'status_todo',
  IN_PROGRESS: 'status_in_progress',
  DONE: 'status_done',
};

const STATUS_TOAST_KEYS: Record<TaskStatus, string> = {
  TODO: 'task_reopened',
  IN_PROGRESS: 'task_started',
  DONE: 'task_completed',
};

const STATUS_ACTIVE_CLASS: Record<TaskStatus, string> = {
  TODO: 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-100',
  IN_PROGRESS: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  DONE: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300',
};

const taskItemVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 320, damping: 30, mass: 0.7 },
  },
  exit: { opacity: 0, x: -24, scale: 0.96, transition: { duration: 0.18, ease: [0.4, 0, 1, 1] as const } },
};

export const TaskItem: React.FC<Props> = ({ task, onStatusChanged, onEdit, onDelete }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (newStatus === task.status || loading) return;
    setLoading(true);
    try {
      await changeTaskStatus(task.id, newStatus);

      if (activeCompletionToastId) {
        toast.dismiss(activeCompletionToastId);
      }
      const id = toast((toastInstance) => (
        <div className="flex items-center gap-4">
          <span>{t(STATUS_TOAST_KEYS[newStatus])}</span>
          <button
            onClick={async () => {
              toast.dismiss(toastInstance.id);
              if (activeCompletionToastId === toastInstance.id) {
                activeCompletionToastId = null;
              }
              try {
                await undoLastAction();
                onStatusChanged();
                toast.success(t('action_undone'));
              } catch (e) {
                toast.error(t('failed_to_undo'));
              }
            }}
            className="px-3 py-1 bg-zinc-800 text-white rounded text-xs font-medium hover:bg-zinc-700 active:scale-95 transition-all"
          >
            {t('undo')}
          </button>
        </div>
      ), { duration: 4000 });
      activeCompletionToastId = id;

      onStatusChanged();
    } catch (err) {
      toast.error(t('failed_to_update_task_status'));
    } finally {
      setLoading(false);
    }
  };

  const isDone = task.status === 'DONE';
  const isRecurring = (task.recurrenceDays ?? 0) > 0;
  const recurrenceLabel = isRecurring
    ? task.recurrenceDays === 1 ? t('every_day')
    : task.recurrenceDays === 7 ? t('every_week')
    : task.recurrenceDays === 14 ? t('every_2_weeks')
    : task.recurrenceDays === 30 ? t('every_month')
    : t('recurrence_every_n_days', { n: task.recurrenceDays })
    : '';

  return (
    <motion.div
      layout
      layoutId={task.id}
      variants={taskItemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ layout: { type: 'spring', stiffness: 380, damping: 32, mass: 0.7 } }}
      className={`group p-4 rounded-xl border flex items-center gap-4 transition-shadow duration-200 will-change-transform ${
        isDone
          ? 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800/50 opacity-60'
          : task.isOverdue
            ? 'bg-red-50/50 dark:bg-red-900/10 border-red-500/50 hover:border-red-500 dark:hover:border-red-400 hover:shadow-lg hover:shadow-red-500/10'
            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20'
      }`}
    >
      <div
        role="radiogroup"
        aria-label={t('status')}
        className="shrink-0 flex flex-col gap-0.5 p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/60"
      >
        {STATUS_ORDER.map((status) => {
          const Icon = STATUS_ICONS[status];
          const isActive = task.status === status;
          return (
            <button
              key={status}
              role="radio"
              aria-checked={isActive}
              onClick={() => handleStatusChange(status)}
              disabled={loading}
              title={t(STATUS_TITLE_KEYS[status])}
              className={`p-1.5 rounded-md transition-all duration-150 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed ${
                isActive
                  ? STATUS_ACTIVE_CLASS[status]
                  : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60'
              }`}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-medium truncate transition-colors duration-200 ${isDone ? 'line-through text-zinc-400 dark:text-zinc-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
          {task.title}
        </h4>

        {task.description && (
          <p className={`text-xs mt-1 line-clamp-2 transition-colors duration-200 ${isDone ? 'text-zinc-400 dark:text-zinc-600' : 'text-zinc-500 dark:text-zinc-400'}`}>
            {task.description}
          </p>
        )}

        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-2 text-xs">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ring-1 ring-inset ring-current/10 transition-transform duration-200 group-hover:scale-[1.03] ${PRIORITY_COLORS[task.priority]}`}>
            <Flag className="w-3 h-3" />
            {task.priority}
          </span>

          {task.deadline && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full transition-colors duration-200 ${task.isOverdue && !isDone ? 'text-red-500 font-medium bg-red-500/5' : 'text-zinc-500 bg-zinc-500/5'}`}>
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(task.deadline), 'MMM d, h:mm a')}
            </span>
          )}

          {isRecurring && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 ring-1 ring-inset ring-indigo-500/20 transition-transform duration-200 group-hover:scale-[1.03]"
              title={recurrenceLabel}
            >
              <Repeat className="w-3.5 h-3.5" />
              {recurrenceLabel}
            </span>
          )}

          {task.isOverdue && !isDone && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium text-red-500 bg-red-500/10 ring-1 ring-inset ring-red-500/20"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              {t('overdue')}
            </motion.span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2">
        {onEdit && (
          <button
            onClick={onEdit}
            className="p-1.5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all duration-150 active:scale-90"
            title={t('edit_task_title')}
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-1.5 text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-zinc-800 rounded-lg transition-all duration-150 active:scale-90"
            title={t('delete_task_title')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

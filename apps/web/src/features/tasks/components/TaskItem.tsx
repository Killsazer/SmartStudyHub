import React, { useState } from 'react';
import { Calendar, Flag, CheckCircle2, Circle, Edit2, Trash2, AlertCircle, Repeat } from 'lucide-react';
import { Task, changeTaskStatus, undoLastAction } from '../api/tasks.api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

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

export const TaskItem: React.FC<Props> = ({ task, onStatusChanged, onEdit, onDelete }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const toggleStatus = async () => {
    setLoading(true);
    const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    try {
      await changeTaskStatus(task.id, newStatus);

      if (newStatus === 'DONE') {
        if (activeCompletionToastId) {
          toast.dismiss(activeCompletionToastId);
        }
        const id = toast((toastInstance) => (
          <div className="flex items-center gap-4">
            <span>{t('task_completed')}</span>
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
              className="px-3 py-1 bg-zinc-800 text-white rounded text-xs font-medium hover:bg-zinc-700 transition-colors"
            >
              {t('undo')}
            </button>
          </div>
        ), { duration: 4000 });
        activeCompletionToastId = id;
      } else {
        toast.success(t('task_reopened'));
      }

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
    <div className={`group p-4 rounded-xl border flex items-center gap-4 transition-all ${isDone ? 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800/50 opacity-60' : task.isOverdue ? 'bg-red-50/50 dark:bg-red-900/10 border-red-500/50 hover:border-red-500 dark:hover:border-red-400 hover:shadow-lg hover:shadow-red-500/10' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20'}`}>
      <button 
        onClick={toggleStatus} 
        disabled={loading}
        className={`shrink-0 transition-colors ${isDone ? 'text-indigo-500' : 'text-zinc-400 dark:text-zinc-600 hover:text-indigo-500 dark:hover:text-indigo-400'}`}
      >
        {isDone ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
      </button>

      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-medium truncate ${isDone ? 'line-through text-zinc-400 dark:text-zinc-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
          {task.title}
        </h4>

        {task.description && (
          <p className={`text-xs mt-1 line-clamp-2 ${isDone ? 'text-zinc-400 dark:text-zinc-600' : 'text-zinc-500 dark:text-zinc-400'}`}>
            {task.description}
          </p>
        )}

        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs">
          <span className={`flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[task.priority]}`}>
            <Flag className="w-3 h-3" />
            {task.priority}
          </span>

          {task.deadline && (
            <span className={`flex items-center gap-1 ${task.isOverdue && !isDone ? 'text-red-500 font-medium' : 'text-zinc-500'}`}>
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(task.deadline), 'MMM d, h:mm a')}
            </span>
          )}

          {isRecurring && (
            <span
              className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium"
              title={recurrenceLabel}
            >
              <Repeat className="w-3.5 h-3.5" />
              {recurrenceLabel}
            </span>
          )}

          {task.isOverdue && !isDone && (
            <span className="flex items-center gap-1 text-red-500 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              {t('overdue')}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
        {onEdit && (
          <button onClick={onEdit} className="p-1.5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors" title={t('edit_task_title')}>
            <Edit2 className="w-4 h-4" />
          </button>
        )}
        {onDelete && (
          <button onClick={onDelete} className="p-1.5 text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-zinc-800 rounded-lg transition-colors" title={t('delete_task_title')}>
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

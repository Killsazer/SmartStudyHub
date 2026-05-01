import React from 'react';
import { Calendar, Flag, Edit2, Trash2, AlertCircle, Repeat } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { Task } from '../api/tasks.api';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface Props {
  task: Task;
  onEdit?: () => void;
  onDelete?: () => void;
  isOverlay?: boolean;
}

const PRIORITY_COLORS = {
  LOW: 'text-zinc-500 bg-zinc-500/10',
  MEDIUM: 'text-amber-500 bg-amber-500/10',
  HIGH: 'text-red-500 bg-red-500/10',
};

export const TaskCard: React.FC<Props> = ({ task, onEdit, onDelete, isOverlay = false }) => {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    disabled: isOverlay,
  });

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
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`group p-3 rounded-xl border touch-none select-none transition-shadow duration-200 ${
        isDragging && !isOverlay
          ? 'opacity-30'
          : isOverlay
            ? 'cursor-grabbing shadow-2xl shadow-black/20 ring-2 ring-indigo-500/50 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
            : isDone
              ? 'cursor-grab bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800/50 opacity-70 hover:shadow-md'
              : task.isOverdue
                ? 'cursor-grab bg-red-50/50 dark:bg-red-900/10 border-red-500/50 hover:shadow-lg hover:shadow-red-500/10'
                : 'cursor-grab bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className={`text-sm font-medium leading-snug ${isDone ? 'line-through text-zinc-400 dark:text-zinc-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
          {task.title}
        </h4>
        {!isOverlay && (
          <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            {onEdit && (
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="p-1 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-all duration-150 active:scale-90"
                title={t('edit_task_title')}
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="p-1 text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-zinc-800 rounded transition-all duration-150 active:scale-90"
                title={t('delete_task_title')}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {task.description && (
        <p className={`text-xs mt-1.5 line-clamp-2 ${isDone ? 'text-zinc-400 dark:text-zinc-600' : 'text-zinc-500 dark:text-zinc-400'}`}>
          {task.description}
        </p>
      )}

      <div className="flex items-center flex-wrap gap-1.5 mt-2.5 text-xs">
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full font-medium ring-1 ring-inset ring-current/10 ${PRIORITY_COLORS[task.priority]}`}>
          <Flag className="w-3 h-3" />
          {task.priority}
        </span>

        {task.deadline && (
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full ${task.isOverdue && !isDone ? 'text-red-500 font-medium bg-red-500/5' : 'text-zinc-500 bg-zinc-500/5'}`}>
            <Calendar className="w-3 h-3" />
            {format(new Date(task.deadline), 'MMM d')}
          </span>
        )}

        {isRecurring && (
          <span
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 ring-1 ring-inset ring-indigo-500/20"
            title={recurrenceLabel}
          >
            <Repeat className="w-3 h-3" />
          </span>
        )}

        {task.isOverdue && !isDone && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full font-medium text-red-500 bg-red-500/10 ring-1 ring-inset ring-red-500/20">
            <AlertCircle className="w-3 h-3" />
            {t('overdue')}
          </span>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  closestCenter,
} from '@dnd-kit/core';
import { Circle, Clock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Task, TaskStatus, changeTaskStatus, undoLastAction } from '../api/tasks.api';
import { TaskCard } from './TaskCard';

interface Props {
  tasks: Task[];
  onStatusChanged: () => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const COLUMNS: { status: TaskStatus; titleKey: string; Icon: typeof Circle; accentClass: string; dotClass: string }[] = [
  {
    status: 'TODO',
    titleKey: 'status_todo',
    Icon: Circle,
    accentClass: 'border-zinc-300/70 dark:border-zinc-700/60',
    dotClass: 'bg-zinc-400 dark:bg-zinc-500',
  },
  {
    status: 'IN_PROGRESS',
    titleKey: 'status_in_progress',
    Icon: Clock,
    accentClass: 'border-amber-300/60 dark:border-amber-500/30',
    dotClass: 'bg-amber-400 dark:bg-amber-400',
  },
  {
    status: 'DONE',
    titleKey: 'status_done',
    Icon: CheckCircle2,
    accentClass: 'border-indigo-300/60 dark:border-indigo-500/30',
    dotClass: 'bg-indigo-400 dark:bg-indigo-400',
  },
];

const STATUS_TOAST_KEYS: Record<TaskStatus, string> = {
  TODO: 'task_reopened',
  IN_PROGRESS: 'task_started',
  DONE: 'task_completed',
};

let activeBoardToastId: string | null = null;

interface ColumnProps {
  status: TaskStatus;
  titleKey: string;
  Icon: typeof Circle;
  accentClass: string;
  dotClass: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  draggingTaskId: string | null;
}

const BoardColumn: React.FC<ColumnProps> = ({ status, titleKey, Icon, accentClass, dotClass, tasks, onEdit, onDelete, draggingTaskId }) => {
  const { t } = useTranslation();
  const { setNodeRef, isOver } = useDroppable({ id: status });

  const draggingFromOtherColumn =
    draggingTaskId !== null && tasks.find((task) => task.id === draggingTaskId) === undefined;

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-0 rounded-xl border-2 border-dashed bg-zinc-50/50 dark:bg-zinc-900/30 transition-colors duration-150 ${
        isOver
          ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20'
          : accentClass
      }`}
    >
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-200/70 dark:border-zinc-800/70">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} aria-hidden />
          <Icon className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-300 truncate">
            {t(titleKey)}
          </h3>
        </div>
        <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 shrink-0">
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-col gap-2 p-2 min-h-[140px]">
        {tasks.length === 0 ? (
          <div className={`flex-1 flex items-center justify-center text-xs text-zinc-400 dark:text-zinc-600 italic px-2 py-6 rounded-lg ${
            draggingFromOtherColumn ? 'border border-dashed border-zinc-300 dark:border-zinc-700' : ''
          }`}>
            {draggingFromOtherColumn ? t('drop_here') : '—'}
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={() => onEdit(task)}
              onDelete={() => onDelete(task.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export const TaskBoard: React.FC<Props> = ({ tasks, onStatusChanged, onEdit, onDelete }) => {
  const { t } = useTranslation();
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const tasksByStatus = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = { TODO: [], IN_PROGRESS: [], DONE: [] };
    for (const task of localTasks) map[task.status].push(task);
    return map;
  }, [localTasks]);

  const activeTask = activeId ? localTasks.find((task) => task.id === activeId) ?? null : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = String(active.id);
    const newStatus = over.id as TaskStatus;
    const task = localTasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    const previous = localTasks;
    setLocalTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));

    try {
      await changeTaskStatus(taskId, newStatus);

      if (activeBoardToastId) toast.dismiss(activeBoardToastId);
      const toastId = toast(
        (toastInstance) => (
          <div className="flex items-center gap-4">
            <span>{t(STATUS_TOAST_KEYS[newStatus])}</span>
            <button
              onClick={async () => {
                toast.dismiss(toastInstance.id);
                if (activeBoardToastId === toastInstance.id) activeBoardToastId = null;
                try {
                  await undoLastAction();
                  onStatusChanged();
                  toast.success(t('action_undone'));
                } catch {
                  toast.error(t('failed_to_undo'));
                }
              }}
              className="px-3 py-1 bg-zinc-800 text-white rounded text-xs font-medium hover:bg-zinc-700 active:scale-95 transition-all"
            >
              {t('undo')}
            </button>
          </div>
        ),
        { duration: 4000 },
      );
      activeBoardToastId = toastId;

      onStatusChanged();
    } catch {
      setLocalTasks(previous);
      toast.error(t('failed_to_update_task_status'));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {COLUMNS.map((col) => (
          <BoardColumn
            key={col.status}
            {...col}
            tasks={tasksByStatus[col.status]}
            onEdit={onEdit}
            onDelete={onDelete}
            draggingTaskId={activeId}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
};

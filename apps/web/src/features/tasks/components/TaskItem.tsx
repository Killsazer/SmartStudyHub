import React, { useState } from 'react';
import { Calendar, Flag, CheckCircle2, Circle } from 'lucide-react';
import { Task, changeTaskStatus } from '../api/tasks.api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface Props {
  task: Task;
  onStatusChanged: () => void;
}

const PRIORITY_COLORS = {
  LOW: 'text-zinc-500 bg-zinc-500/10',
  MEDIUM: 'text-amber-500 bg-amber-500/10',
  HIGH: 'text-red-500 bg-red-500/10',
};

export const TaskItem: React.FC<Props> = ({ task, onStatusChanged }) => {
  const [loading, setLoading] = useState(false);

  const toggleStatus = async () => {
    setLoading(true);
    const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    try {
      await changeTaskStatus(task.id, newStatus);
      toast.success(newStatus === 'DONE' ? 'Task completed! Command & Observer triggered' : 'Task reopened');
      onStatusChanged();
    } catch (err) {
      toast.error('Failed to update task status');
    } finally {
      setLoading(false);
    }
  };

  const isDone = task.status === 'DONE';

  return (
    <div className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${isDone ? 'bg-zinc-900/40 border-zinc-800/50 opacity-60' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:shadow-lg hover:shadow-black/20'}`}>
      <button 
        onClick={toggleStatus} 
        disabled={loading}
        className={`shrink-0 transition-colors ${isDone ? 'text-indigo-500' : 'text-zinc-600 hover:text-indigo-400'}`}
      >
        {isDone ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
      </button>

      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-medium truncate ${isDone ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
          {task.title}
        </h4>
        
        <div className="flex items-center gap-3 mt-1.5 text-xs">
          <span className={`flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[task.priority]}`}>
            <Flag className="w-3 h-3" />
            {task.priority}
          </span>
          
          {task.deadline && (
            <span className="flex items-center gap-1 text-zinc-500">
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(task.deadline), 'MMM d, h:mm a')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

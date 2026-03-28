import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createTask, updateTask, Task } from '../api/tasks.api';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  subjectId: string;
  onCreated: () => void;
  initialData?: Task | null;
}

export const CreateTaskModal: React.FC<Props> = ({ isOpen, onClose, subjectId, onCreated, initialData }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '');
      setDescription(initialData?.description || '');
      setPriority(initialData?.priority || 'MEDIUM');
      
      if (initialData?.deadline) {
        // Convert to YYYY-MM-DDThh:mm for datetime-local
        try {
          const date = new Date(initialData.deadline);
          // Adjust for local timezone offset
          const offset = date.getTimezoneOffset() * 60000;
          const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
          setDeadline(localISOTime);
        } catch {
          setDeadline('');
        }
      } else {
        setDeadline('');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title,
        description,
        priority,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
      };

      if (initialData) {
        await updateTask(initialData.id, payload);
        toast.success('Task updated successfully');
      } else {
        await createTask({ ...payload, subjectId });
        toast.success('Task created successfully');
      }

      onCreated();
      onClose();
    } catch {
      toast.error(initialData ? 'Failed to update task' : 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold">{initialData ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="e.g. Write report"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-100 min-h-[80px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Add more details here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Deadline (Optional)</label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-medium text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg font-medium bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-50"
            >
              {loading ? 'Saving...' : initialData ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

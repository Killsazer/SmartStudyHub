import React, { useState, useEffect } from 'react';
import { X, Repeat } from 'lucide-react';
import { createTask, updateTask, Task, TaskPriority } from '../api/tasks.api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  subjectId: string;
  onCreated: () => void;
  initialData?: Task | null;
}

export const CreateTaskModal: React.FC<Props> = ({ isOpen, onClose, subjectId, onCreated, initialData }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [deadline, setDeadline] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceDays, setRecurrenceDays] = useState(7);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '');
      setDescription(initialData?.description || '');
      setPriority(initialData?.priority || 'MEDIUM');
      
      if (initialData?.deadline) {
        // Convert to YYYY-MM-DDThh:mm
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

      if (initialData?.recurrenceDays) {
        setIsRecurring(true);
        setRecurrenceDays(initialData.recurrenceDays);
      } else {
        setIsRecurring(false);
        setRecurrenceDays(7);
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
        deadline: deadline ? new Date(deadline).toISOString() : null,
        recurrenceDays: isRecurring ? recurrenceDays : 0,
      };

      if (initialData) {
        await updateTask(initialData.id, payload);
        toast.success(t('task_updated'));
      } else {
        await createTask({ ...payload, subjectId });
        toast.success(t('task_created'));
      }

      onCreated();
      onClose();
    } catch {
      toast.error(initialData ? t('failed_to_update_task') : t('failed_to_create_task'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/20 dark:bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{initialData ? t('edit_task') : t('new_task')}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t('title')}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder={t('title_ph_task')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t('description_opt')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 min-h-[80px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder={t('description_ph')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t('priority')}</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="LOW">{t('priority_low')}</option>
              <option value="MEDIUM">{t('priority_medium')}</option>
              <option value="HIGH">{t('priority_high')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t('deadline_opt')}</label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsRecurring(!isRecurring)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                isRecurring 
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' 
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <Repeat className="w-4 h-4" />
              {t('recurring_task')}
            </button>

            {isRecurring && (
              <select
                value={recurrenceDays}
                onChange={(e) => setRecurrenceDays(Number(e.target.value))}
                className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value={1}>{t('every_day')}</option>
                <option value={7}>{t('every_week')}</option>
                <option value={14}>{t('every_2_weeks')}</option>
                <option value={30}>{t('every_month')}</option>
              </select>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg font-medium bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-50"
            >
              {loading ? t('saving') : initialData ? t('save_changes') : t('create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

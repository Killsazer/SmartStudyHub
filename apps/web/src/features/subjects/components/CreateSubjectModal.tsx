import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SubjectItem } from '../api/subjects.api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; color: string }) => Promise<void>;
  initialData?: SubjectItem | null;
}

const COLORS = ['#6366f1', '#ef4444', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export const CreateSubjectModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '');
      setColor(initialData?.color || COLORS[0]);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ title, color });
      setTitle('');
      setColor(COLORS[0]);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/20 dark:bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{initialData ? t('edit_subject') : t('new_subject')}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t('subject_title')}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder={t('subject_title_ph')}
              required
            />
          </div>



          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">{t('accent_color')}</label>
            <div className="flex gap-3">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 scale-110' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c, borderColor: color === c ? c : 'transparent' }}
                />
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg font-medium bg-indigo-500 hover:bg-indigo-600 text-white transition-colors disabled:opacity-50"
            >
              {loading ? t('saving') : initialData ? t('save_changes') : t('create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

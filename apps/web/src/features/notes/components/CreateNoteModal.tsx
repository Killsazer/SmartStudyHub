import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createNote, updateNote, NoteComponent } from '../api/notes.api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  parentId?: string;
  subjectId: string;
  onCreated: () => void;
  initialData?: NoteComponent | null;
}

export const CreateNoteModal: React.FC<Props> = ({ isOpen, onClose, parentId, subjectId, onCreated, initialData }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSection, setIsSection] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '');
      setContent(initialData?.content || '');
      setIsSection(initialData ? initialData.type === 'section' : false);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initialData) {
        await updateNote(initialData.id, {
          title,
          content: isSection ? undefined : content,
        });
        toast.success(isSection ? t('folder_updated') : t('note_updated'));
      } else {
        await createNote({
          title,
          content: isSection ? undefined : content,
          parentId: parentId || undefined,
          subjectId,
        });
        toast.success(isSection ? t('folder_created') : t('note_created'));
      }
      setTitle('');
      setContent('');
      setIsSection(false);
      onCreated();
      onClose();
    } catch {
      toast.error(t('failed_to_create_note'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/20 dark:bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            {initialData ? (isSection ? t('edit_folder') : t('edit_note_title')) : (isSection ? t('new_folder') : t('new_note'))}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={isSection}
                onChange={(e) => setIsSection(e.target.checked)}
                disabled={!!initialData}
                className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-zinc-900 disabled:opacity-50"
              />
              {t('create_as_folder')}
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t('title')}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:ring-1 focus:ring-indigo-500"
              placeholder={isSection ? t('title_ph_folder') : t('title_ph_note')}
              required
            />
          </div>

          {!isSection && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t('content')}</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 min-h-[100px] focus:ring-1 focus:ring-indigo-500"
                placeholder={t('content_ph')}
              />
            </div>
          )}

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

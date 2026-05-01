import React, { useState, useEffect, useRef } from 'react';
import { X, FileText, FolderOpen, Clock, Hash } from 'lucide-react';
import { createNote, updateNote, NoteComponent } from '../api/notes.api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { RichTextEditor } from './RichTextEditor';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  parentId?: string;
  subjectId: string;
  onCreated: () => void;
  initialData?: NoteComponent | null;
}

/**
 * Extracts plain-text word count from an HTML string.
 * Uses a temporary element to strip tags — works in browser environments.
 */
function getWordCount(html: string): number {
  if (!html) return 0;
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  const text = tmp.textContent || tmp.innerText || '';
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export const NoteEditorModal: React.FC<Props> = ({ isOpen, onClose, parentId, subjectId, onCreated, initialData }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSection, setIsSection] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '');
      setContent(initialData?.content || '');
      setIsSection(initialData ? initialData.type === 'section' : false);
      setIsDirty(false);
    }
  }, [isOpen, initialData]);

  // Focus title on open for new notes
  useEffect(() => {
    if (!isOpen || initialData) return;
    const timer = setTimeout(() => titleRef.current?.focus(), 250);
    return () => clearTimeout(timer);
  }, [isOpen, initialData]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setIsDirty(true);
  };

  const handleContentChange = (html: string) => {
    setContent(html);
    setIsDirty(true);
  };

  const wordCount = getWordCount(content);
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const handleSave = async () => {
    if (!title.trim()) {
      titleRef.current?.focus();
      return;
    }
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
      setIsDirty(false);
      onCreated();
      onClose();
    } catch {
      toast.error(t('failed_to_create_note'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) onClose();
  };

  // Ctrl/Cmd+S to save, Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (isDirty || !initialData) handleSave();
      }
      if (e.key === 'Escape' && !loading) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDirty, title, content, loading]);

  const isCreatingNew = !initialData;
  const showFolderToggle = isCreatingNew && !parentId;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="note-editor-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 sm:py-12 px-4 bg-zinc-900/30 dark:bg-black/70 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget && !loading) handleClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 20 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] as const }}
            className="w-full max-w-4xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl shadow-zinc-900/10 dark:shadow-black/30 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* ── Header bar ── */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-zinc-100 dark:border-zinc-800/60 shrink-0">
              <div className="flex items-center gap-2.5">
                {isSection ? (
                  <FolderOpen className="w-5 h-5 text-indigo-400" />
                ) : (
                  <FileText className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                )}
                <span className="text-sm font-medium text-zinc-400 dark:text-zinc-500">
                  {initialData
                    ? (isSection ? t('edit_folder') : t('edit_note_title'))
                    : (isSection ? t('new_folder') : t('new_note'))
                  }
                </span>
              </div>
              <div className="flex items-center gap-3">
                {!isSection && wordCount > 0 && (
                  <div className="hidden sm:flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      {wordCount} {t('words')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {readingMinutes} {t('min_read')}
                    </span>
                  </div>
                )}
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 transition-all duration-150 active:scale-90"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ── Document body (scrollable) ── */}
            <div className="flex-1 overflow-y-auto px-8 sm:px-12 py-8">
              {/* Folder toggle — only for new root-level creation */}
              {showFolderToggle && (
                <div className="mb-6">
                  <label className="inline-flex items-center gap-2.5 text-sm text-zinc-500 dark:text-zinc-400 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      checked={isSection}
                      onChange={(e) => {
                        setIsSection(e.target.checked);
                        setIsDirty(true);
                      }}
                      className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 bg-transparent text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                      {t('create_as_folder')}
                    </span>
                  </label>
                </div>
              )}

              {/* Title — large, borderless, document-like */}
              <input
                ref={titleRef}
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder={isSection ? t('title_ph_folder') : t('title_ph_note')}
                className="w-full text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white placeholder-zinc-300 dark:placeholder-zinc-700 bg-transparent border-none outline-none focus:ring-0 p-0 mb-1 leading-tight tracking-tight"
              />

              {/* Subtle divider */}
              <div className="h-px bg-zinc-100 dark:bg-zinc-800/50 my-6" />

              {/* Content area — Rich Text Editor for notes, placeholder for folders */}
              {!isSection && (
                <RichTextEditor
                  content={content}
                  onChange={handleContentChange}
                  placeholder={t('content_ph')}
                />
              )}

              {isSection && (
                <div className="flex items-center justify-center py-16 text-zinc-300 dark:text-zinc-700">
                  <FolderOpen className="w-12 h-12" />
                </div>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="flex items-center justify-between px-8 py-4 border-t border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-950/30 shrink-0">
              <span className="text-xs text-zinc-400 dark:text-zinc-600 hidden sm:inline">
                {initialData ? '⌘S / Ctrl+S' : ''}
              </span>
              <div className="flex items-center gap-3 ml-auto">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-150 active:scale-95"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading || !title.trim()}
                  className="px-5 py-2 rounded-lg text-sm font-medium bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 active:scale-95 shadow-sm hover:shadow-md hover:shadow-indigo-500/20"
                >
                  {loading ? t('saving') : initialData ? t('save_changes') : t('create')}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

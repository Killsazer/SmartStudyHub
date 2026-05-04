import React, { useState } from 'react';
import { Folder, FolderOpen, FileText, Plus, ChevronDown, Edit2, Trash2, Clock, Hash, FileDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { NoteComponent, downloadNoteSubtreePdf } from '../api/notes.api';

interface NoteNodeProps {
  node: NoteComponent;
  onAddChild: (parentId: string) => void;
  onEdit: (node: NoteComponent) => void;
  onDelete: (id: string) => void;
  depth?: number;
}

const noteNodeVariants = {
  hidden: { opacity: 0, y: 4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 360, damping: 30, mass: 0.6 },
  },
  exit: { opacity: 0, x: -16, transition: { duration: 0.16, ease: [0.4, 0, 1, 1] as const } },
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const NoteNode: React.FC<NoteNodeProps> = ({ node, onAddChild, onEdit, onDelete, depth = 0 }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const isSection = node.type === 'section';

  const handleExport = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isExporting) return;
    setIsExporting(true);
    const toastId = toast.loading(t('exporting_pdf'));
    try {
      const blob = await downloadNoteSubtreePdf(node.id);
      const safeName = (node.title || 'note').replace(/[^a-z0-9-_]+/gi, '_').slice(0, 60) || 'note';
      downloadBlob(blob, `${safeName}.pdf`);
      toast.success(t('pdf_downloaded'), { id: toastId });
    } catch {
      toast.error(t('failed_to_export_pdf'), { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div
      layout
      variants={noteNodeVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ layout: { type: 'spring', stiffness: 380, damping: 32, mass: 0.6 } }}
      className="flex flex-col"
    >
      <div
        className="group flex items-center gap-2 py-2 px-3 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded-lg transition-colors duration-150 cursor-pointer"
        style={{ paddingLeft: `${depth * 1.5 + 0.75}rem` }}
        onClick={() => {
          if (isSection) setIsExpanded(!isExpanded);
          else onEdit(node);
        }}
      >
        <button className="w-4 h-4 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 flex items-center justify-center transition-colors">
          {isSection ? (
            <motion.span
              animate={{ rotate: isExpanded ? 0 : -90 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] as const }}
              className="inline-flex"
            >
              <ChevronDown className="w-4 h-4" />
            </motion.span>
          ) : (
            <span className="w-4 h-4" />
          )}
        </button>

        {isSection ? (
          isExpanded ? <FolderOpen className="w-4 h-4 text-indigo-400" /> : <Folder className="w-4 h-4 text-indigo-400" />
        ) : (
          <FileText className="w-4 h-4 text-zinc-400" />
        )}

        <span className={`text-sm transition-colors duration-150 ${isSection ? 'font-medium text-zinc-800 dark:text-zinc-200' : 'text-zinc-600 dark:text-zinc-300'}`}>
          {node.title}
        </span>

        <div className="flex items-center gap-2 ml-3 opacity-80">
          {(node.wordCount ?? 0) > 0 && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
              <Hash className="w-3 h-3" />
              {node.wordCount} {t('words')}
            </span>
          )}
          {(node.readingMinutes ?? 0) > 0 && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
              <Clock className="w-3 h-3" />
              {node.readingMinutes} {t('min_read')}
            </span>
          )}
        </div>

        <div className="ml-auto opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity duration-150">
          {isSection && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddChild(node.id);
              }}
              className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded text-zinc-500 dark:text-zinc-400 transition-all duration-150 active:scale-90"
              title={t('add_to_folder')}
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded text-zinc-500 dark:text-zinc-400 transition-all duration-150 active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
            title={t('download_pdf')}
          >
            <FileDown className={`w-4 h-4 ${isExporting ? 'animate-pulse' : ''}`} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(node);
            }}
            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded text-zinc-500 dark:text-zinc-400 transition-all duration-150 active:scale-90"
            title={t('edit')}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node.id);
            }}
            className="p-1 hover:bg-red-50 dark:hover:bg-zinc-700 rounded text-red-500 dark:text-red-400 transition-all duration-150 active:scale-90"
            title={t('delete')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isSection && isExpanded && node.children && node.children.length > 0 && (
          <motion.div
            key="children"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] as const }}
            className="flex flex-col overflow-hidden"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {node.children.map(child => (
                <NoteNode key={child.id} node={child} onAddChild={onAddChild} onEdit={onEdit} onDelete={onDelete} depth={depth + 1} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface NoteTreeProps {
  data: NoteComponent[];
  subjectId: string;
  onAddNote: (parentId?: string) => void;
  onEditNote: (node: NoteComponent) => void;
  onDeleteNote: (id: string) => void;
}

const treeContainerVariants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
};

export const NoteTree: React.FC<NoteTreeProps> = ({ data, onAddNote, onEditNote, onDeleteNote }) => {
  const { t } = useTranslation();

  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] as const }}
        className="p-8 border border-zinc-200 dark:border-zinc-800 border-dashed rounded-xl text-center flex flex-col items-center"
      >
        <FolderOpen className="w-8 h-8 text-zinc-400 dark:text-zinc-500 mb-3" />
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">{t('no_notes')}</p>
        <button
          onClick={() => onAddNote()}
          className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium flex items-center gap-1 transition-colors active:scale-95"
        >
          <Plus className="w-4 h-4" /> {t('create_note')}
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={treeContainerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {data.map(node => (
          <NoteNode key={node.id} node={node} onAddChild={onAddNote} onEdit={onEditNote} onDelete={onDeleteNote} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

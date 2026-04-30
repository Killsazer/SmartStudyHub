import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderOpen, X, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { SubjectCard } from '../../subjects/components/SubjectCard';
import { SubjectItem, deleteAllSubjects } from '../../subjects/api/subjects.api';
import { useConfirm } from '../../../shared/components/ConfirmDialog';

const MODAL_EASE = [0.22, 1, 0.36, 1] as const;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  subjects: SubjectItem[];
  onAddNew: () => void;
  onEditSubject: (subject: SubjectItem) => void;
  onDeleteSubject: (e: React.MouseEvent, id: string) => void;
  onSubjectClick: (id: string) => void;
  onDataChanged: () => void;
}

export const SubjectsManagementModal: React.FC<Props> = ({
  isOpen,
  onClose,
  subjects,
  onAddNew,
  onEditSubject,
  onDeleteSubject,
  onSubjectClick,
  onDataChanged,
}) => {
  const { t } = useTranslation();
  const confirm = useConfirm();

  const handleDeleteAll = async () => {
    const ok = await confirm({
      message: t('delete_all_subjects_confirm'),
      tone: 'danger',
      confirmLabel: t('delete_all'),
    });
    if (!ok) return;
    try {
      await deleteAllSubjects();
      toast.success(t('all_subjects_deleted'));
      onDataChanged();
    } catch {
      toast.error(t('error'));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="subjects-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.24, ease: MODAL_EASE }}
            className="w-full max-w-5xl h-[85vh] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FolderOpen className="w-6 h-6 text-indigo-500" /> {t('manage_subjects')}
              </h2>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex justify-end gap-3 mb-6">
                {subjects.length > 0 && (
                  <button
                    onClick={handleDeleteAll}
                    className="bg-red-500/10 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg font-medium hover:bg-red-500/20 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('delete_all')}
                  </button>
                )}
                <button
                  onClick={onAddNew}
                  className="bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-600 transition-colors"
                >
                  {t('new_subject')}
                </button>
              </div>

              {subjects.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">{t('no_subjects_created')}</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subjects.map(subj => (
                    <SubjectCard
                      key={subj.id}
                      subject={subj}
                      onClick={() => { onClose(); onSubjectClick(subj.id); }}
                      onEdit={(e) => { e.stopPropagation(); onEditSubject(subj); }}
                      onDelete={(e) => onDeleteSubject(e, subj.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

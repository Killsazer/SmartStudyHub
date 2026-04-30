import React from 'react';
import { BookOpen, Edit2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SubjectItem } from '../api/subjects.api';

interface Props {
  subject: SubjectItem;
  onClick: () => void;
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
}

export const SubjectCard: React.FC<Props> = ({ subject, onClick, onEdit, onDelete }) => {
  const { t } = useTranslation();
  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xl hover:-translate-y-1"
      style={{ borderTopColor: subject.color, borderTopWidth: '4px' }}
    >
      <div 
        className="absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity group-hover:opacity-20"
        style={{ backgroundColor: subject.color }}
      />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 w-fit">
            <BookOpen className="w-6 h-6" style={{ color: subject.color }} />
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                title={t('edit_subject_title')}
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-1.5 hover:bg-red-50 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-red-500 transition-colors"
                title={t('delete_subject_title')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">{subject.title}</h3>
        

      </div>
    </div>
  );
};

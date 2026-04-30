import React from 'react';
import { ScheduleSlot, Teacher, ClassType } from '../api/schedule.api';
import { SubjectItem } from '../../subjects/api/subjects.api';
import { MapPin, User, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LinkifyText } from '../../../shared/components/LinkifyText';

interface Props {
  slot: ScheduleSlot;
  subject?: SubjectItem;
  teacher?: Teacher;
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
}

const getClassTypeColor = (type: ClassType) => {
  switch (type) {
    case 'LECTURE': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/50';
    case 'LAB': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50';
    case 'PRACTICE': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800/50';
    default: return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700';
  }
};

export const ScheduleSlotCard: React.FC<Props> = ({ slot, subject, teacher, onEdit, onDelete }) => {
  const { t } = useTranslation();
  const typeColor = getClassTypeColor(slot.classType);
  const subjectColor = subject?.color || '#3b82f6';
  const activeTaskCount = subject?.tasks?.filter(t => t.status !== 'DONE').length || 0;
  
  const getClassTypeLabel = (type: ClassType) => {
    switch (type) {
      case 'LECTURE': return t('lecture');
      case 'LAB': return t('lab');
      case 'PRACTICE': return t('practice');
      default: return type;
    }
  };

  return (
    <div 
      className="w-[150px] sm:w-[160px] md:w-full h-full p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group/card"
    >
      {/* Accent Color Strip */}
      <div 
        className="absolute top-0 left-0 w-1 h-full"
        style={{ backgroundColor: subjectColor }}
      />
      
      {(onEdit || onDelete) && (
        <div className="absolute top-1 right-1 z-10 flex gap-0.5 opacity-0 group-hover/card:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={onEdit}
              title={t('edit')}
              className="p-1 rounded bg-white/90 dark:bg-zinc-800/90 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 shadow-sm"
            >
              <Pencil className="w-3 h-3" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              title={t('delete')}
              className="p-1 rounded bg-white/90 dark:bg-zinc-800/90 hover:bg-red-100 dark:hover:bg-red-900/40 text-zinc-600 dark:text-zinc-300 hover:text-red-500 shadow-sm"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      <div className="pl-1 h-full flex flex-col">
        <div className="flex justify-between items-start mb-1">
          <span className={`text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded border ${typeColor}`}>
            {getClassTypeLabel(slot.classType)}
          </span>
          {activeTaskCount > 0 && (
            <span className="text-[10px] sm:text-xs font-semibold text-zinc-600 dark:text-zinc-400 group-hover/card:opacity-0 transition-opacity">
              {activeTaskCount}
            </span>
          )}
        </div>
        
        <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white leading-tight mb-1 break-words">
          {subject?.title || 'Unknown Subject'}
        </h4>
        
        <div className="mt-auto space-y-0.5">
          {teacher && (
            <div className="flex items-start gap-1 text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              <User className="w-3 h-3 text-zinc-400 shrink-0 mt-0.5" />
              <LinkifyText text={teacher.name} className="break-words" />
            </div>
          )}
          {slot.location && (
            <div className="flex items-start gap-1 text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              <MapPin className="w-3 h-3 text-zinc-400 shrink-0 mt-0.5" />
              <LinkifyText text={slot.location} className="break-all whitespace-pre-wrap" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

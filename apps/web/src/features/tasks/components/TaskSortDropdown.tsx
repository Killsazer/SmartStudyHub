import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SortStrategy } from '../api/tasks.api';

interface Props {
  value: SortStrategy;
  onChange: (val: SortStrategy) => void;
}

export const TaskSortDropdown: React.FC<Props> = ({ value, onChange }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortStrategy)}
        className="bg-transparent text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white focus:outline-none cursor-pointer"
      >
        <option value="deadline" className="bg-white dark:bg-zinc-900">{t('sort_deadline')}</option>
        <option value="priority" className="bg-white dark:bg-zinc-900">{t('sort_priority')}</option>
        <option value="title" className="bg-white dark:bg-zinc-900">{t('sort_title')}</option>
      </select>
    </div>
  );
};

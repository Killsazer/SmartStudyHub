import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { SortStrategy } from '../api/tasks.api';

interface Props {
  value: SortStrategy;
  onChange: (val: SortStrategy) => void;
}

export const TaskSortDropdown: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="w-4 h-4 text-zinc-500" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortStrategy)}
        className="bg-transparent text-sm font-medium text-zinc-300 hover:text-white focus:outline-none cursor-pointer"
      >
        <option value="deadline">Sort by Deadline (Strategy)</option>
        <option value="priority">Sort by Priority (Strategy)</option>
        <option value="title">Sort by Title (Strategy)</option>
      </select>
    </div>
  );
};

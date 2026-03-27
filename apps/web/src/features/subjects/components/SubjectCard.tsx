import React from 'react';
import { BookOpen, User } from 'lucide-react';
import { SubjectItem } from '../api/subjects.api';

interface Props {
  subject: SubjectItem;
  onClick: () => void;
}

export const SubjectCard: React.FC<Props> = ({ subject, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 hover:bg-zinc-800/50 transition-all cursor-pointer hover:border-zinc-700 hover:shadow-xl hover:-translate-y-1"
      style={{ borderTopColor: subject.color, borderTopWidth: '4px' }}
    >
      <div 
        className="absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity group-hover:opacity-20"
        style={{ backgroundColor: subject.color }}
      />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2 rounded-xl bg-zinc-800/80 w-fit">
            <BookOpen className="w-6 h-6" style={{ color: subject.color }} />
          </div>
        </div>
        
        <h3 className="text-xl font-bold tracking-tight text-white mb-2">{subject.title}</h3>
        
        {subject.teacherName && (
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <User className="w-4 h-4" />
            <span>{subject.teacherName}</span>
          </div>
        )}
      </div>
    </div>
  );
};

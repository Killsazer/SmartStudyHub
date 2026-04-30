import React, { useState } from 'react';
import { Folder, FolderOpen, FileText, Plus, ChevronRight, ChevronDown, Edit2, Trash2, Clock, Hash } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NoteComponent } from '../api/notes.api';

interface NoteNodeProps {
  node: NoteComponent;
  onAddChild: (parentId: string) => void;
  onEdit: (node: NoteComponent) => void;
  onDelete: (id: string) => void;
  depth?: number;
}

const NoteNode: React.FC<NoteNodeProps> = ({ node, onAddChild, onEdit, onDelete, depth = 0 }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);
  const isSection = node.type === 'section';

  return (
    <div className="flex flex-col">
      <div 
        className="group flex items-center gap-2 py-2 px-3 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded-lg transition-colors cursor-pointer"
        style={{ paddingLeft: `${depth * 1.5 + 0.75}rem` }}
        onClick={() => {
          if (isSection) setIsExpanded(!isExpanded);
          else onEdit(node);
        }}
      >
        <button className="w-4 h-4 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 flex items-center justify-center">
          {isSection ? (
            isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          ) : (
            <span className="w-4 h-4" /> // Spacing for leaf nodes
          )}
        </button>
        
        {isSection ? (
          isExpanded ? <FolderOpen className="w-4 h-4 text-indigo-400" /> : <Folder className="w-4 h-4 text-indigo-400" />
        ) : (
          <FileText className="w-4 h-4 text-zinc-400" />
        )}

        <span className={`text-sm ${isSection ? 'font-medium text-zinc-800 dark:text-zinc-200' : 'text-zinc-600 dark:text-zinc-300'}`}>
          {node.title}
        </span>

        {/* METRICS BADGES */}
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

        <div className="ml-auto opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
          {isSection && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddChild(node.id);
              }}
              className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded text-zinc-500 dark:text-zinc-400"
              title={t('add_to_folder')}
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(node);
            }}
            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded text-zinc-500 dark:text-zinc-400"
            title={t('edit')}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node.id);
            }}
            className="p-1 hover:bg-red-50 dark:hover:bg-zinc-700 rounded text-red-500 dark:text-red-400"
            title={t('delete')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isSection && isExpanded && node.children && (
        <div className="flex flex-col">
          {node.children.map(child => (
            <NoteNode key={child.id} node={child} onAddChild={onAddChild} onEdit={onEdit} onDelete={onDelete} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

interface NoteTreeProps {
  data: NoteComponent[];
  subjectId: string;
  onAddNote: (parentId?: string) => void;
  onEditNote: (node: NoteComponent) => void;
  onDeleteNote: (id: string) => void;
}

export const NoteTree: React.FC<NoteTreeProps> = ({ data, onAddNote, onEditNote, onDeleteNote }) => {
  const { t } = useTranslation();
  
  if (data.length === 0) {
    return (
      <div className="p-8 border border-zinc-200 dark:border-zinc-800 border-dashed rounded-xl text-center flex flex-col items-center">
        <FolderOpen className="w-8 h-8 text-zinc-400 dark:text-zinc-500 mb-3" />
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">{t('no_notes')}</p>
        <button
          onClick={() => onAddNote()}
          className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> {t('create_note')}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2">
      {data.map(node => (
        <NoteNode key={node.id} node={node} onAddChild={onAddNote} onEdit={onEditNote} onDelete={onDeleteNote} />
      ))}
    </div>
  );
};

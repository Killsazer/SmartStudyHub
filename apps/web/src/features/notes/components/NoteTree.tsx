import React, { useState } from 'react';
import { Folder, FolderOpen, FileText, Plus, ChevronRight, ChevronDown, Edit2, Trash2 } from 'lucide-react';
import { NoteComponent } from '../api/notes.api';

interface NoteNodeProps {
  node: NoteComponent;
  onAddChild: (parentId: string) => void;
  onEdit: (node: NoteComponent) => void;
  onDelete: (id: string) => void;
  depth?: number;
}

const NoteNode: React.FC<NoteNodeProps> = ({ node, onAddChild, onEdit, onDelete, depth = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const isSection = node.type === 'section';

  return (
    <div className="flex flex-col">
      <div 
        className="group flex items-center gap-2 py-2 px-3 hover:bg-zinc-800/50 rounded-lg transition-colors cursor-pointer"
        style={{ paddingLeft: `${depth * 1.5 + 0.75}rem` }}
        onClick={() => {
          if (isSection) setIsExpanded(!isExpanded);
          else onEdit(node);
        }}
      >
        <button className="w-4 h-4 text-zinc-500 hover:text-zinc-300 flex items-center justify-center">
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

        <span className={`text-sm ${isSection ? 'font-medium text-zinc-200' : 'text-zinc-300'}`}>
          {node.title}
        </span>

        <div className="ml-auto opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
          {isSection && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddChild(node.id);
              }}
              className="p-1 hover:bg-zinc-700 rounded text-zinc-400"
              title="Add to folder"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(node);
            }}
            className="p-1 hover:bg-zinc-700 rounded text-zinc-400"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node.id);
            }}
            className="p-1 hover:bg-zinc-700 rounded text-red-400"
            title="Delete"
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
  // Option to filter tree based on Subject ID if the backend doesn't filter perfectly
  // We'll just display what the backend throws us for now as a demo.
  
  if (data.length === 0) {
    return (
      <div className="p-8 border border-zinc-800 border-dashed rounded-xl text-center flex flex-col items-center">
        <FolderOpen className="w-8 h-8 text-zinc-500 mb-3" />
        <p className="text-zinc-400 text-sm mb-4">No notes here yet.</p>
        <button
          onClick={() => onAddNote()}
          className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Create Note
        </button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-2">
      {data.map(node => (
        <NoteNode key={node.id} node={node} onAddChild={onAddNote} onEdit={onEditNote} onDelete={onDeleteNote} />
      ))}
    </div>
  );
};

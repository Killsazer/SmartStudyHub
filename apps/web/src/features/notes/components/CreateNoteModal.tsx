import React, { useState } from 'react';
import { X } from 'lucide-react';
import { createNote } from '../api/notes.api';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  parentId?: string;
  subjectId: string;
  onCreated: () => void;
}

export const CreateNoteModal: React.FC<Props> = ({ isOpen, onClose, parentId, subjectId, onCreated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSection, setIsSection] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createNote({
        title,
        content: isSection ? undefined : content,
        parentId: parentId || undefined,
        subjectId,
      });
      toast.success(isSection ? 'Folder created!' : 'Note created!');
      setTitle('');
      setContent('');
      setIsSection(false);
      onCreated();
      onClose();
    } catch {
      toast.error('Failed to create note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold">{isSection ? 'New Folder' : 'New Note'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
              <input
                type="checkbox"
                checked={isSection}
                onChange={(e) => setIsSection(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-zinc-900"
              />
              Create as Folder (Section)
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-100 focus:ring-1 focus:ring-indigo-500"
              placeholder={isSection ? "e.g. Chapter 1" : "e.g. Lecture summary"}
              required
            />
          </div>

          {!isSection && (
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-100 min-h-[100px] focus:ring-1 focus:ring-indigo-500"
                placeholder="Write your note here..."
              />
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-medium text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg font-medium bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

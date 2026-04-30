import React, { useState } from 'react';
import { X, UserPlus, FileEdit, Trash2, Mail, Link as LinkIcon } from 'lucide-react';
import { Teacher, createTeacher, deleteTeacher, updateTeacher } from '../api/schedule.api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  teachers: Teacher[];
  onTeachersChange: () => void;
}

export const TeacherManager: React.FC<Props> = ({ isOpen, onClose, teachers, onTeachersChange }) => {
  const { t } = useTranslation();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formName, setFormName] = useState('');
  const [formPhoto, setFormPhoto] = useState('');
  const [formContacts, setFormContacts] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setFormName('');
    setFormPhoto('');
    setFormContacts('');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (t: Teacher) => {
    setFormName(t.name);
    setFormPhoto(t.photoUrl || '');
    setFormContacts(t.contacts || '');
    setEditingId(t.id);
    setIsAdding(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) { toast.error(t('teacher_name_required')); return; }

    setLoading(true);
    try {
      if (editingId) {
        await updateTeacher(editingId, {
          name: formName,
          photoUrl: formPhoto || null,
          contacts: formContacts || null
        } as any);
        toast.success(t('teacher_updated'));
      } else {
        await createTeacher({
          name: formName,
          photoUrl: formPhoto || undefined,
          contacts: formContacts || undefined
        });
        toast.success(t('teacher_added'));
      }
      resetForm();
      onTeachersChange();
    } catch {
      toast.error(t('failed_to_save_teacher'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(t('delete_teacher_confirm', { name }))) return;
    try {
      await deleteTeacher(id);
      toast.success(t('teacher_deleted'));
      onTeachersChange();
    } catch {
      toast.error(t('failed_to_delete_teacher'));
    }
  };

  const getAvatar = (name: string, url?: string) => {
    return url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=128`;
  };

  const isFormOpen = isAdding || editingId !== null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="w-full max-w-2xl h-[80vh] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl flex flex-col overflow-hidden">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            {t('teachers')}
          </h2>
          <div className="flex items-center gap-3">
            {!isFormOpen && (
              <button 
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
              >
                <UserPlus className="w-4 h-4" /> {t('add')}
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* Form Section */}
          {isFormOpen && (
            <div className="bg-zinc-50 dark:bg-zinc-800/30 p-5 rounded-xl border border-zinc-200 dark:border-zinc-700/50">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-4">
                {editingId ? t('edit_teacher') : t('new_teacher')}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">{t('teacher_name')}</label>
                    <input 
                      type="text" value={formName} onChange={e => setFormName(e.target.value)} required
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400"
                      placeholder={t('teacher_name_ph')}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">{t('photo_url')}</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                      <input 
                        type="url" value={formPhoto} onChange={e => setFormPhoto(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400"
                        placeholder={t('photo_url_ph')}
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">{t('contacts')}</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                      <textarea 
                        value={formContacts} onChange={e => setFormContacts(e.target.value)}
                        rows={3}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 resize-none"
                        placeholder={t('contacts_ph')}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 justify-end mt-4">
                  <button type="button" onClick={resetForm} className="px-4 py-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                    {t('cancel')}
                  </button>
                  <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50">
                    {loading ? t('saving') : (editingId ? t('save_changes') : t('create'))}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List Section */}
          {!isFormOpen && teachers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-zinc-500 dark:text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
              <span className="text-4xl mb-4">👥</span>
              <p>{t('empty_teachers')}</p>
              <button onClick={() => setIsAdding(true)} className="mt-2 text-indigo-500 hover:text-indigo-600 font-semibold text-sm">
                {t('add_first_teacher')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teachers.map(t => (
                <div key={t.id} className="flex items-center gap-4 p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl group relative">
                  <img 
                    src={getAvatar(t.name, t.photoUrl)} 
                    alt={t.name}
                    className="w-12 h-12 rounded-full border border-zinc-100 dark:border-zinc-800 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-zinc-900 dark:text-white text-sm truncate">{t.name}</h4>
                    {t.contacts && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 whitespace-pre-wrap">{t.contacts}</p>}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(t)} className="p-1.5 text-zinc-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-md transition-colors">
                      <FileEdit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(t.id, t.name)} className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

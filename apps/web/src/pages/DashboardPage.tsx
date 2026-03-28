import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, BookOpen, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../features/auth/AuthContext';
import { getSubjects, createSubject, updateSubject, deleteSubject, SubjectItem } from '../features/subjects/api/subjects.api';
import { useTranslation } from 'react-i18next';
import { ThemeLangToggle } from '../shared/components/ThemeLangToggle';
import { SubjectCard } from '../features/subjects/components/SubjectCard';
import { CreateSubjectModal } from '../features/subjects/components/CreateSubjectModal';

const DashboardPage = () => {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const data = await getSubjects();
      setSubjects(data);
    } catch (error) {
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (data: { title: string; teacherName?: string; color: string }) => {
    try {
      if (editingSubject) {
        await updateSubject(editingSubject.id, data);
        setSubjects(subjects.map(s => s.id === editingSubject.id ? { ...s, ...data } : s));
        toast.success('Subject updated!');
      } else {
        const newSubj = await createSubject(data);
        setSubjects([...subjects, newSubj]);
        toast.success('Subject created!');
      }
    } catch (error) {
      toast.error(editingSubject ? 'Failed to update subject' : 'Failed to create subject');
      throw error;
    }
  };

  const handleDeleteSubject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this subject? All tasks and notes inside will be lost.')) return;
    
    try {
      await deleteSubject(id);
      setSubjects(subjects.filter(s => s.id !== id));
      toast.success('Subject deleted');
    } catch (error) {
      toast.error('Failed to delete subject');
    }
  };

  const handleOpenEdit = (e: React.MouseEvent, subject: SubjectItem) => {
    e.stopPropagation();
    setEditingSubject(subject);
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingSubject(null);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-200">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-500/10 p-1.5 rounded-lg">
              <BookOpen className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            </div>
            <span className="font-semibold text-lg tracking-tight">{t('app_name')}</span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeLangToggle />
            <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800"></div>
            <button
              onClick={logout}
              className="text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              {t('sign_out')}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold tracking-tight">{t('my_subjects')}</h1>
          <button
            onClick={handleOpenCreate}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('new_subject')}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
          </div>
        ) : subjects.length === 0 ? (
          <div className="p-12 border border-zinc-200 dark:border-zinc-800 border-dashed rounded-2xl text-center flex flex-col items-center">
            <div className="bg-zinc-100 dark:bg-zinc-800/50 p-4 rounded-full mb-4">
              <BookOpen className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
            </div>
            <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">{t('no_subjects')}</h3>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mb-6">{t('no_subjects_desc')}</p>
            <button
              onClick={handleOpenCreate}
              className="bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-600 transition-colors"
            >
              {t('configure_subject')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subj) => (
              <SubjectCard
                key={subj.id}
                subject={subj}
                onClick={() => navigate(`/subjects/${subj.id}`)}
                onEdit={(e) => handleOpenEdit(e, subj)}
                onDelete={(e) => handleDeleteSubject(e, subj.id)}
              />
            ))}
          </div>
        )}
      </main>

      <CreateSubjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSubject(null);
        }}
        onSubmit={handleCreateSubject}
        initialData={editingSubject}
      />
    </div>
  );
};

export default DashboardPage;

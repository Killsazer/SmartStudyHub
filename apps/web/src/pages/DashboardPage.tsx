import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, BookOpen, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../features/auth/AuthContext';
import { getSubjects, createSubject, SubjectItem } from '../features/subjects/api/subjects.api';
import { SubjectCard } from '../features/subjects/components/SubjectCard';
import { CreateSubjectModal } from '../features/subjects/components/CreateSubjectModal';

const DashboardPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      const newSubj = await createSubject(data);
      setSubjects([...subjects, newSubj]);
      toast.success('Subject created!');
    } catch (error) {
      toast.error('Failed to create subject');
      throw error;
    }
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-500/10 p-1.5 rounded-lg">
              <BookOpen className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="font-semibold text-lg tracking-tight">Smart Study Hub</span>
          </div>

          <button
            onClick={logout}
            className="text-zinc-400 hover:text-red-400 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold tracking-tight">My Subjects</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Subject
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
          </div>
        ) : subjects.length === 0 ? (
          <div className="p-12 border border-zinc-800 border-dashed rounded-2xl text-center flex flex-col items-center">
            <div className="bg-zinc-800/50 p-4 rounded-full mb-4">
              <BookOpen className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No subjects yet</h3>
            <p className="text-zinc-400 max-w-sm mb-6">Create your first subject to start organizing your tasks and notes.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-600 transition-colors"
            >
              Configure Subject
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subj) => (
              <SubjectCard
                key={subj.id}
                subject={subj}
                onClick={() => navigate(`/subjects/${subj.id}`)}
              />
            ))}
          </div>
        )}
      </main>

      <CreateSubjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateSubject}
      />
    </div>
  );
};

export default DashboardPage;

import React, { useState } from 'react';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { startOnboarding } from '../api/onboarding.api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface Props {
  isOpen: boolean;
  onComplete: () => void;
}

export const WelcomeModal: React.FC<Props> = ({ isOpen, onComplete }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await startOnboarding();
      toast.success(t('onboarding_success', 'Sample study data generated successfully!'));
      onComplete();
    } catch (err) {
      toast.error(t('onboarding_error', 'Failed to generate sample data.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/60 dark:bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-8 flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-500 rounded-2xl flex items-center justify-center mb-6">
          <Sparkles className="w-8 h-8" />
        </div>
        
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">
          {t('welcome_title', 'Welcome to Smart Study Hub!')}
        </h2>
        
        <p className="text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
          {t('welcome_subtitle', 'Your workspace is currently empty. Would you like us to generate a sample study plan to help you explore the features?')}
        </p>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3.5 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              {t('generate_sample_data', 'Generate Sample Data')}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <button
          onClick={onComplete}
          disabled={loading}
          className="mt-4 text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          {t('skip_for_now', 'Skip for now')}
        </button>
      </div>
    </div>
  );
};

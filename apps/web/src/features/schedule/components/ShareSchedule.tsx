import React, { useState } from 'react';
import { Share2, DownloadCloud, UploadCloud, Copy, Check, X } from 'lucide-react';
import { exportSchedule, importSchedule } from '../api/schedule.api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

const MODAL_EASE = [0.22, 1, 0.36, 1] as const;

const HEADER_BTN_SPRING = { type: 'spring' as const, stiffness: 420, damping: 24, mass: 0.6 };
const headerBtnVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.94 },
};
const tabBtnVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.97 },
};

const shareIconVariants = {
  rest: { rotate: 0, scale: 1 },
  hover: { rotate: 12, scale: 1.12 },
  tap: { rotate: 0, scale: 0.92 },
};
const importIconVariants = {
  rest: { y: 0, scale: 1 },
  hover: { y: 2, scale: 1.12 },
  tap: { y: 0, scale: 0.92 },
};
const exportIconVariants = {
  rest: { y: 0, scale: 1 },
  hover: { y: -2, scale: 1.12 },
  tap: { y: 0, scale: 0.92 },
};

interface Props {
  onImportComplete: () => void;
}

export const ShareSchedule: React.FC<Props> = ({ onImportComplete }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [hashToken, setHashToken] = useState<string | null>(null);
  const [importToken, setImportToken] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const token = await exportSchedule();
      setHashToken(token);
    } catch {
      toast.error(t('failed_to_export_schedule'));
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importToken.trim()) { toast.error(t('import_code_required')); return; }
    if (importToken.length !== 8) { toast.error(t('import_invalid_format')); return; }

    setLoading(true);
    try {
      await importSchedule(importToken.toLowerCase());
      toast.success(t('schedule_imported_success'));
      setIsOpen(false);
      setImportToken('');
      onImportComplete();
    } catch {
      toast.error(t('failed_to_import_schedule'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (hashToken) {
      navigator.clipboard.writeText(hashToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success(t('copied'));
    }
  };

  return (
    <>
      <motion.button
        onClick={() => { setActiveTab('export'); setIsOpen(true); setHashToken(null); }}
        variants={headerBtnVariants}
        initial="rest"
        animate="rest"
        whileHover="hover"
        whileTap="tap"
        transition={HEADER_BTN_SPRING}
        className="px-3 py-1.5 rounded-lg text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors flex items-center gap-2"
      >
        <motion.span
          variants={shareIconVariants}
          transition={HEADER_BTN_SPRING}
          className="inline-flex"
        >
          <Share2 className="w-4 h-4" />
        </motion.span>
        <span className="hidden sm:inline-block">{t('share_schedule')}</span>
      </motion.button>

      <motion.button
        onClick={() => { setActiveTab('import'); setIsOpen(true); }}
        variants={headerBtnVariants}
        initial="rest"
        animate="rest"
        whileHover="hover"
        whileTap="tap"
        transition={HEADER_BTN_SPRING}
        className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors flex items-center gap-2 shadow-sm hover:shadow-md hover:shadow-indigo-500/10"
      >
        <motion.span
          variants={importIconVariants}
          transition={HEADER_BTN_SPRING}
          className="inline-flex"
        >
          <DownloadCloud className="w-4 h-4" />
        </motion.span>
        <span className="hidden md:inline-block">{t('import_schedule')}</span>
      </motion.button>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="share-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/30 dark:bg-black/50 backdrop-blur-sm"
              onClick={(e) => { if (e.target === e.currentTarget && !loading) setIsOpen(false); }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ duration: 0.22, ease: MODAL_EASE }}
                className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex-shrink-0">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{t('share_access')}</h2>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-red-500 transition-colors"
                title={t('close')}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
              <motion.button
                onClick={() => setActiveTab('export')}
                variants={tabBtnVariants}
                initial="rest"
                animate="rest"
                whileHover="hover"
                whileTap="tap"
                transition={HEADER_BTN_SPRING}
                className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'export' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                <motion.span
                  variants={exportIconVariants}
                  transition={HEADER_BTN_SPRING}
                  className="inline-flex"
                >
                  <UploadCloud className="w-4 h-4" />
                </motion.span>
                {t('export_tab')}
              </motion.button>
              <motion.button
                onClick={() => setActiveTab('import')}
                variants={tabBtnVariants}
                initial="rest"
                animate="rest"
                whileHover="hover"
                whileTap="tap"
                transition={HEADER_BTN_SPRING}
                className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'import' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                <motion.span
                  variants={importIconVariants}
                  transition={HEADER_BTN_SPRING}
                  className="inline-flex"
                >
                  <DownloadCloud className="w-4 h-4" />
                </motion.span>
                {t('import_tab')}
              </motion.button>
            </div>

            <div className="p-6 overflow-y-auto">
              {activeTab === 'export' ? (
                <div className="flex flex-col items-center text-center">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                    {t('generate_code_desc')}
                  </p>
                  
                  {hashToken ? (
                    <div className="w-full space-y-4">
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          value={hashToken}
                          className="w-full bg-zinc-50 dark:bg-zinc-950 font-mono text-center text-2xl tracking-[0.2em] font-bold border-2 border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl py-4"
                        />
                        <button
                          onClick={handleCopy}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                        >
                          {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </div>
                      <p className="text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg text-left">
                        {t('share_warning')}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={handleExport}
                      disabled={loading}
                      className="w-full py-3 rounded-xl font-bold bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    >
                      {loading ? t('generating') : t('generate_code')}
                    </button>
                  )}
                </div>
              ) : (
                <form onSubmit={handleImport} className="space-y-4">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center mb-4">
                    {t('import_desc')}
                  </p>
                  <div>
                    <input
                      type="text"
                      value={importToken}
                      onChange={(e) => setImportToken(e.target.value.trim())}
                      maxLength={8}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-4 text-center text-xl font-mono tracking-widest text-zinc-900 dark:text-white uppercase placeholder-zinc-300 dark:placeholder-zinc-700 focus:border-indigo-500 focus:ring-0 transition-colors"
                      placeholder="XXXXXXXX"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || importToken.length !== 8}
                    className="w-full py-3 rounded-xl font-bold bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? t('importing') : t('apply_schedule')}
                  </button>
                </form>
              )}
            </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

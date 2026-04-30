import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const MODAL_EASE = [0.22, 1, 0.36, 1] as const;

export type ConfirmTone = 'danger' | 'default';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

interface PendingState extends ConfirmOptions {
  isOpen: boolean;
}

const INITIAL_STATE: PendingState = { isOpen: false, message: '' };

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const [state, setState] = useState<PendingState>(INITIAL_STATE);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((options) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setState({ ...options, isOpen: true });
    });
  }, []);

  const close = (result: boolean) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setState((prev) => ({ ...prev, isOpen: false }));
  };

  const tone = state.tone ?? 'danger';
  const confirmBtnClasses =
    tone === 'danger'
      ? 'bg-red-500 hover:bg-red-600 text-white'
      : 'bg-indigo-500 hover:bg-indigo-600 text-white';
  const iconWrapClasses =
    tone === 'danger'
      ? 'bg-red-50 dark:bg-red-500/10 text-red-500'
      : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500';

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {createPortal(
        <AnimatePresence>
          {state.isOpen && (
            <motion.div
              key="confirm-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm"
              onClick={(e) => {
                if (e.target === e.currentTarget) close(false);
              }}
            >
              <motion.div
                role="alertdialog"
                aria-modal="true"
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ duration: 0.2, ease: MODAL_EASE }}
                className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="flex items-start gap-4 p-6">
                  <div className={`shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full ${iconWrapClasses}`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                      {state.title || t('confirm_title')}
                    </h3>
                    <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                      {state.message}
                    </p>
                  </div>
                  <button
                    onClick={() => close(false)}
                    className="shrink-0 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex justify-end gap-2 px-6 pb-6">
                  <button
                    onClick={() => close(false)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    {state.cancelLabel || t('cancel')}
                  </button>
                  <button
                    autoFocus
                    onClick={() => close(true)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors active:scale-95 ${confirmBtnClasses}`}
                  >
                    {state.confirmLabel || t('confirm')}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = (): ConfirmFn => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within a ConfirmProvider');
  return ctx;
};

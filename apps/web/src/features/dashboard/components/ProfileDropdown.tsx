import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, LogOut, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../auth/AuthContext';
import { useConfirm } from '../../../shared/components/ConfirmDialog';

export const ProfileDropdown: React.FC = () => {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const { logout, user, deleteAccount } = useAuth();

  const profileRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (profileRef.current) {
      const rect = profileRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setIsOpen((v) => !v);
  };

  const handleDeleteAccount = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    const ok = await confirm({
      title: t('delete_account'),
      message: t('delete_account_confirm'),
      tone: 'danger',
      confirmLabel: t('delete'),
    });
    if (!ok) return;
    try {
      await deleteAccount();
      toast.success(t('account_deleted'));
    } catch {
      toast.error(t('error_deleting_account'));
    }
  };

  const initials = `${user?.firstName?.[0]?.toUpperCase() || '?'}${user?.lastName?.[0]?.toUpperCase() || ''}`;

  return (
    <div ref={profileRef}>
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
          {initials}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform hidden sm:block ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && createPortal(
        <div
          className="fixed z-[100]"
          style={{ top: position.top, right: position.right }}
        >
          <div className="w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-zinc-900 dark:text-white truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-2">
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {t('sign_out')}
              </button>
              <button
                onMouseDown={handleDeleteAccount}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors mt-1"
              >
                <Trash2 className="w-4 h-4" />
                {t('delete_account')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

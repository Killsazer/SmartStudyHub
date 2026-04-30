import React from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, FolderOpen, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ShareSchedule } from '../../schedule/components/ShareSchedule';
import { ThemeLangToggle } from '../../../shared/components/ThemeLangToggle';
import { ProfileDropdown } from './ProfileDropdown';

const HEADER_BTN_SPRING = { type: 'spring' as const, stiffness: 420, damping: 24, mass: 0.6 };

const headerBtnVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.94 },
};

const teachersIconVariants = {
  rest: { rotate: 0, y: 0, scale: 1 },
  hover: { rotate: 0, y: -2, scale: 1.12 },
  tap: { rotate: 0, y: 0, scale: 0.92 },
};

const subjectsIconVariants = {
  rest: { rotate: 0, scale: 1 },
  hover: { rotate: -8, scale: 1.12 },
  tap: { rotate: 0, scale: 0.92 },
};

interface Props {
  onOpenTeachers: () => void;
  onOpenSubjects: () => void;
  onImportComplete: () => void;
}

export const DashboardHeader: React.FC<Props> = ({ onOpenTeachers, onOpenSubjects, onImportComplete }) => {
  const { t } = useTranslation();

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur sticky top-0 z-40">
      <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-500/10 p-1.5 rounded-lg">
            <CalendarDays className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          </div>
          <span className="font-semibold text-lg tracking-tight hidden sm:inline-block">Smart Study Hub</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
          <motion.button
            onClick={onOpenTeachers}
            variants={headerBtnVariants}
            initial="rest"
            animate="rest"
            whileHover="hover"
            whileTap="tap"
            transition={HEADER_BTN_SPRING}
            className="px-3 py-1.5 rounded-lg text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors flex items-center gap-2"
          >
            <motion.span variants={teachersIconVariants} transition={HEADER_BTN_SPRING} className="inline-flex">
              <Users className="w-4 h-4" />
            </motion.span>
            <span className="hidden sm:inline-block">{t('teachers')}</span>
          </motion.button>

          <motion.button
            onClick={onOpenSubjects}
            variants={headerBtnVariants}
            initial="rest"
            animate="rest"
            whileHover="hover"
            whileTap="tap"
            transition={HEADER_BTN_SPRING}
            className="px-3 py-1.5 rounded-lg text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors flex items-center gap-2"
          >
            <motion.span variants={subjectsIconVariants} transition={HEADER_BTN_SPRING} className="inline-flex">
              <FolderOpen className="w-4 h-4" />
            </motion.span>
            <span className="hidden sm:inline-block">{t('subjects')}</span>
          </motion.button>

          <ShareSchedule onImportComplete={onImportComplete} />

          <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 hidden md:block"></div>

          <div className="hidden md:block">
            <ThemeLangToggle />
          </div>

          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
};

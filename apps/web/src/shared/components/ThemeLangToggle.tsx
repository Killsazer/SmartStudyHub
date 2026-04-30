import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { STORAGE_KEYS } from '../storage-keys';

export const ThemeLangToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const isEn = i18n.language && i18n.language.startsWith('en');
    const newLang = isEn ? 'uk' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, newLang);
  };

  const displayLang = i18n.language && i18n.language.startsWith('uk') ? 'UK' : 'EN';

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleLanguage}
        className="px-2 py-1 text-sm font-medium rounded text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
        title={t('toggle_language')}
      >
        {displayLang}
      </button>

      <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700"></div>

      <button
        onClick={toggleTheme}
        className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
        title={t('toggle_theme')}
      >
        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
    </div>
  );
};

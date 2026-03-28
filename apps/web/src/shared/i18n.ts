import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// the translations
const resources = {
  en: {
    translation: {
      // General
      "app_name": "Smart Study Hub",
      "sign_out": "Sign Out",
      "cancel": "Cancel",
      "create": "Create",
      "save_changes": "Save Changes",
      "saving": "Saving...",
      
      // Dashboard
      "my_subjects": "My Subjects",
      "new_subject": "New Subject",
      "edit_subject": "Edit Subject",
      "no_subjects": "No subjects yet",
      "no_subjects_desc": "Create your first subject to start organizing your tasks and notes.",
      "configure_subject": "Configure Subject",

      // Subject Page
      "back_to_dashboard": "Back to Dashboard",
      "active_tasks": "Active Tasks",
      "sort_deadline": "Sort by Deadline (Strategy)",
      "sort_priority": "Sort by Priority (Strategy)",
      "sort_title": "Sort by Title (Strategy)",
      "notes_handouts": "Notes & Handouts",
      "create_task": "Create Task",
      "create_root_note": "Create Root Note/Folder",
      "no_tasks": "No tasks yet. Create one!",
      "no_notes": "No notes here yet.",
      "create_note": "Create Note",
      
      // Auth Pages
      "welcome_back": "Welcome back",
      "sign_in_desc": "Sign in to Smart Study Hub",
      "email": "Email",
      "password": "Password",
      "signing_in": "Signing in...",
      "sign_in": "Sign In",
      "no_account": "Don't have an account?",
      "create_one": "Create one",
      "create_account": "Create Account",
      "join_desc": "Join Smart Study Hub today",
      "first_name": "First Name",
      "last_name": "Last Name",
      "creating_account": "Creating account...",
      "sign_up": "Sign Up",
      "have_account": "Already have an account?",
      
      // Modals (Subject)
      "subject_title": "Subject Title",
      "subject_title_ph": "e.g. Advanced Calculus",
      "teacher_opt": "Teacher (Optional)",
      "teacher_ph": "e.g. Dr. Smith",
      "accent_color": "Accent Color",
      
      // Modals (Task)
      "new_task": "New Task",
      "edit_task": "Edit Task",
      "title": "Title",
      "title_ph_task": "e.g. Write report",
      "description_opt": "Description (Optional)",
      "description_ph": "Add more details here...",
      "priority": "Priority",
      "priority_low": "Low",
      "priority_medium": "Medium",
      "priority_high": "High",
      "deadline_opt": "Deadline (Optional)",

      // Modals (Note)
      "new_folder": "New Folder",
      "new_note": "New Note",
      "edit_folder": "Edit Folder",
      "edit_note_title": "Edit Note",
      "create_as_folder": "Create as Folder (Section)",
      "title_ph_folder": "e.g. Chapter 1",
      "title_ph_note": "e.g. Lecture summary",
      "content": "Content",
      "content_ph": "Write your note here..."
    }
  },
  uk: {
    translation: {
      // General
      "app_name": "Smart Study Hub",
      "sign_out": "Вийти",
      "cancel": "Скасувати",
      "create": "Створити",
      "save_changes": "Зберегти зміни",
      "saving": "Збереження...",
      
      // Dashboard
      "my_subjects": "Мої предмети",
      "new_subject": "Новий предмет",
      "edit_subject": "Редагувати предмет",
      "no_subjects": "Предметів ще немає",
      "no_subjects_desc": "Створіть свій перший предмет, щоб почати організовувати завдання та нотатки.",
      "configure_subject": "Налаштувати предмет",

      // Subject Page
      "back_to_dashboard": "Повернутись на головну",
      "active_tasks": "Активні завдання",
      "sort_deadline": "Сортувати за дедлайном (Стратегія)",
      "sort_priority": "Сортувати за пріоритетом (Стратегія)",
      "sort_title": "Сортувати за назвою (Стратегія)",
      "notes_handouts": "Нотатки та матеріали",
      "create_task": "Створити завдання",
      "create_root_note": "Створити кореневу нотатку/папку",
      "no_tasks": "Завдань ще немає. Створіть одне!",
      "no_notes": "Тут ще немає нотаток.",
      "create_note": "Створити нотатку",
      
      // Auth Pages
      "welcome_back": "З поверненням",
      "sign_in_desc": "Увійдіть до Smart Study Hub",
      "email": "Електронна пошта",
      "password": "Пароль",
      "signing_in": "Вхід...",
      "sign_in": "Увійти",
      "no_account": "Немає акаунту?",
      "create_one": "Створити",
      "create_account": "Створити акаунт",
      "join_desc": "Приєднуйтесь до Smart Study Hub сьогодні",
      "first_name": "Ім'я",
      "last_name": "Прізвище",
      "creating_account": "Створення акаунта...",
      "sign_up": "Зареєструватись",
      "have_account": "Вже є акаунт?",
      
      // Modals (Subject)
      "subject_title": "Назва предмету",
      "subject_title_ph": "напр. Вища математика",
      "teacher_opt": "Викладач (Необов'язково)",
      "teacher_ph": "напр. д-р Іванов",
      "accent_color": "Колір акценту",
      
      // Modals (Task)
      "new_task": "Нове завдання",
      "edit_task": "Редагувати завдання",
      "title": "Назва",
      "title_ph_task": "напр. Написати звіт",
      "description_opt": "Опис (Необов'язково)",
      "description_ph": "Додайте більше деталей тут...",
      "priority": "Пріоритет",
      "priority_low": "Низький",
      "priority_medium": "Середній",
      "priority_high": "Високий",
      "deadline_opt": "Дедлайн (Необов'язково)",

      // Modals (Note)
      "new_folder": "Нова папка",
      "new_note": "Нова нотатка",
      "edit_folder": "Редагувати папку",
      "edit_note_title": "Редагувати нотатку",
      "create_as_folder": "Створити як папку (секцію)",
      "title_ph_folder": "напр. Розділ 1",
      "title_ph_note": "напр. Короткий зміст лекції",
      "content": "Вміст",
      "content_ph": "Пишіть вашу нотатку тут..."
    }
  }
};

const savedLang = localStorage.getItem('language') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

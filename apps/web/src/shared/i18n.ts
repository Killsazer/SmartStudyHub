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
      "time": "Time",
      "monday": "Monday",
      "tuesday": "Tuesday",
      "wednesday": "Wednesday",
      "thursday": "Thursday",
      "friday": "Friday",
      "saturday": "Saturday",

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
      "content_ph": "Write your note here...",

      // Schedule & Teachers
      "my_schedule": "My Schedule",
      "week_1": "Week 1",
      "week_2": "Week 2",
      "teachers": "Teachers",
      "add_teacher": "Add Teacher",
      "edit_teacher": "Edit Teacher",
      "new_teacher": "New Teacher",
      "teacher_name": "Full Name",
      "teacher_name_ph": "e.g. Dr. John Doe",
      "photo_url": "Photo (URL)",
      "photo_url_ph": "Optional. Image URL",
      "contacts": "Contacts",
      "contacts_ph": "Optional. Telegram, Email, etc.",
      "empty_teachers": "Teacher list is empty.",
      "add_first_teacher": "Add your first teacher",
      
      // Share 
      "share_schedule": "Share",
      "import_schedule": "Import",
      "share_access": "Share Access",
      "export_tab": "Export",
      "import_tab": "Import",
      "generate_code_desc": "Generate a unique hash code to share your schedule, subjects, and teachers.",
      "share_warning": "Warning: Personal notes and tasks are NOT shared. Only schedule, teachers, and subjects.",
      "close": "Close",
      "generate_code": "Generate Code",
      "generating": "Generating...",
      "import_desc": "Enter the 8-character hash code to copy the schedule.",
      "apply_schedule": "Apply Schedule",
      "importing": "Importing...",

      // Add Slot
      "add_lesson": "Add Lesson",
      "lesson_type": "Class Type",
      "lecture": "Lecture",
      "lab": "Lab",
      "practice": "Practice",
      "time_slot": "Time (Pair)",
      "no_teacher": "No Teacher",
      "location": "Room / Link",
      "location_ph": "e.g. 305-1, or Zoom link",
      "add": "Add",
      "choose_subject": "Choose Subject"
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
      "time": "Час",
      "monday": "Понеділок",
      "tuesday": "Вівторок",
      "wednesday": "Середа",
      "thursday": "Четвер",
      "friday": "П'ятниця",
      "saturday": "Субота",

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
      "content_ph": "Пишіть вашу нотатку тут...",

      // Schedule & Teachers
      "my_schedule": "Мій Розклад",
      "week_1": "Тиждень 1",
      "week_2": "Тиждень 2",
      "teachers": "Викладачі",
      "add_teacher": "Додати",
      "edit_teacher": "Редагувати викладача",
      "new_teacher": "Новий викладач",
      "teacher_name": "ПІБ",
      "teacher_name_ph": "Іванов І.І.",
      "photo_url": "Фото (URL)",
      "photo_url_ph": "Опціонально. URL зображення",
      "contacts": "Контакти",
      "contacts_ph": "Опціонально. Telegram, Email",
      "empty_teachers": "Список викладачів порожній.",
      "add_first_teacher": "Додати першого викладача",
      
      // Share 
      "share_schedule": "Поділитися",
      "import_schedule": "Імпортувати",
      "share_access": "Спільний доступ",
      "export_tab": "Експортувати",
      "import_tab": "Імпортувати",
      "generate_code_desc": "Згенеруйте унікальний хеш-код, щоб поділитися своїм розкладом, предметами та викладачами.",
      "share_warning": "Увага: ваші персональні нотатки та завдання НЕ передаються. Лише розклад, викладачі та предмети.",
      "close": "Закрити",
      "generate_code": "Згенерувати код",
      "generating": "Генерація...",
      "import_desc": "Введіть 8-значний хеш-код, щоб скопіювати розклад до свого акаунту.",
      "apply_schedule": "Застосувати розклад",
      "importing": "Імпортування...",

      // Add Slot
      "add_lesson": "Додати заняття",
      "lesson_type": "Тип заняття",
      "lecture": "Лекція",
      "lab": "Лабораторна",
      "practice": "Практика",
      "time_slot": "Час (Пара)",
      "no_teacher": "Без викладача",
      "location": "Аудиторія / Посилання",
      "location_ph": "напр. 305-1, або Zoom link",
      "add": "Додати",
      "choose_subject": "Оберіть предмет"
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

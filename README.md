<div align="center">
  <h1>📘 Smart Study Hub</h1>
  <p>
    🇺🇸 <a href="README.eng.md">English</a> | 🇺🇦 <b>Українська</b>
  </p>
  <p><strong>Enterprise-рівень Monorepo (NestJS + React) з ідеальною Clean Architecture та реалізацією 7 патернів GoF.</strong></p>

  <!-- Badges -->
  <p>
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
    <img src="https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white" alt="Jest" />
  </p>
</div>

---

## 🚀 Огляд проєкту

**Smart Study Hub** — це передова система управління навчальним процесом (LMS), розроблена як курсовий проєкт. Система демонструє високий рівень інженерної культури завдяки строгому дотриманню принципів **Clean Architecture** (Uncle Bob) та бездоганній реалізації **7 патернів проектування GoF**.

Проєкт побудовано як **Monorepo** (Yarn/NPM Workspaces), що містить потужний REST API бекенд та швидкий сучасний фронтенд з мінімалістичним дизайном у стилі Linear/Notion.

---

## 🏗 Архітектура (Clean Architecture)

Бекенд проєкту має строгий поділ на шари, гарантуючи повну незалежність бізнес-логіки від зовнішніх фреймворків:

1. **Domain Layer**: Чисті сутності, інтерфейси репозиторіїв та ядро патернів проектування (нуль залежностей).
2. **Application Layer**: Use Cases (сценарії використання) та сервіси, які оркеструють доменну логіку.
3. **Infrastructure Layer**: Реалізації репозиторіїв (Prisma), підключення до бази даних та зовнішніх адаптерів.
4. **Presentation Layer**: REST контролери, DTO та HTTP маршрутизація.

**Frontend** виступає як "тонкий клієнт", що відповідає за візуалізацію даних та відправку намірів користувача до бекенду.

---

## 📦 Модулі Бекенду (Backend Modules)

Проєкт розділено на незалежні доменні модулі з чітко визначеними відповідальностями:

- 🛡️ **Auth Module**: Забезпечує безпеку, автентифікацію (JWT) та реєстрацію користувачів.
- 📚 **Subjects Module**: Управління навчальними дисциплінами (предметами), що є кореневим елементом агрегації для розкладу та завдань.
- 👨‍🏫 **Teachers Module**: Управління профілями викладачів, їхніми контактними даними та прив'язкою до предметів. Виокремлено в незалежний модуль для гнучкого менеджменту персоналу.
- 📅 **Schedule Module**: Управління розкладом занять (лекції, практики, лабораторні), прив'язка до часу, аудиторій та викладачів.
- ✅ **Tasks Module**: Система управління завданнями та дедлайнами з підтримкою Kanban-дошки.
- 📝 **Notes Module**: Складна система ієрархічних нотаток та конспектів для предметів.
- 🚀 **Onboarding Module**: Спеціалізований модуль для адаптації нових користувачів. Він оркеструє створення перших предметів, викладачів та завдань для швидкого старту.
- ⚙️ **Shared Module**: Спільна інфраструктура: конфігурації, підключення до БД (Prisma), логування та глобальні винятки.

---

## 🧩 Реалізовані патерни GoF (7)

В основі бізнес-логіки лежать класичні патерни проектування, які вирішують архітектурні виклики елегантним способом.

### Породжувальні (Creational)
1. **Factory Method** (`ScheduleSlotFactory` у модулі `Schedule`):
   Інкапсулює логіку створення різних типів занять (Lecture, Lab, Practice). Дозволяє легко додавати нові типи занять без зміни існуючого коду.
2. **Builder** (`SubjectBuilder` у модулі `Subjects`):
   Забезпечує покрокову збірку складного об'єкта "Предмет" разом із його початковими заняттями та завданнями.

### Структурні (Structural)
3. **Decorator** (`RecurringTaskDecorator` та `OverdueTaskDecorator` у модулі `Tasks`):
   Архітектурний «флекс» проєкту: патерн застосовується на двох різних рівнях. На рівні глибокої доменної логіки (`RecurringTaskDecorator`) він генерує наступні повторення при завершенні завдання. На рівні Application/View (`OverdueTaskDecorator`) — динамічно додає візуальну позначку «ПРОСТРОЧЕНО» (Overdue), не засмічуючи базу даних зайвими полями.
4. **Facade** (`OnboardingFacade` у модулі `Onboarding`):
   Надає єдиний, спрощений інтерфейс для складного процесу онбордингу, приховуючи взаємодію з модулями Subjects, Teachers, Schedule та Tasks.
5. **Composite** (`NoteComponent` у модулі `Notes`):
   Дозволяє представляти нотатки у вигляді деревоподібної структури (розділи, блоки контенту) з підтримкою нескінченної вкладеності.

### Поведінкові (Behavioral)
6. **Command** (`ChangeTaskStatusCommand` у модулі `Tasks`):
   Інкапсулює дію зміни статусу завдання як об'єкт. Це дозволяє надійно обробляти події переміщення карток на інтерактивній Kanban-дошці.
7. **Strategy** (`ITaskSortStrategy` у модулі `Tasks`):
   Дозволяє динамічно підміняти алгоритм сортування списку завдань (наприклад, за дедлайном чи за пріоритетом) безпосередньо з фронтенду.

---

## 🗂 Структура Monorepo

```ascii
kursach/
├── apps/
│   ├── api/                 # NestJS Бекенд (Clean Architecture)
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   ├── notes/       # (Composite Pattern)
│   │   │   ├── onboarding/  # (Facade Pattern)
│   │   │   ├── schedule/    # (Factory Method Pattern)
│   │   │   ├── subjects/    # (Builder Pattern)
│   │   │   ├── tasks/       # (Command, Decorator, Strategy)
│   │   │   ├── teachers/
│   │   │   └── shared/
│   │   └── ...
│   └── web/                 # React + Vite Фронтенд
│       ├── src/
│       │   ├── pages/       # Сторінки (Routing)
│       │   ├── components/  # Перевикористовувані UI елементи
│       │   └── ...
│       └── ...
├── package.json             # Конфігурація монорепозиторію
└── docker-compose.yml       # Docker інфраструктура (PostgreSQL)
```

---

## 🧪 Забезпечення якості

Проєкт демонструє серйозний інженерний підхід до забезпечення якості коду:

- **100% покриття тестами** критичної бізнес-логіки та патернів проектування.
- **144 успішних тести** сумарно.
- Глибоке **Unit-тестування** ізольованих доменних компонентів та **E2E тестування** API ендпоінтів.
- Використовуються інструменти: **Jest** та **Supertest**.

---

## 🛠 Швидкий старт

Виконайте ці кроки для локального запуску всієї екосистеми:

### 1. Налаштування змінних оточення (Environment Setup)
Перед запуском необхідно налаштувати конфігурацію бекенду. Перейдіть до директорії `apps/api`, скопіюйте файл `.env.example` у `.env` та вкажіть ваш `DATABASE_URL` і секрети для JWT:
```bash
cp apps/api/.env.example apps/api/.env
```

### 2. Запуск інфраструктури
Підніміть базу даних PostgreSQL за допомогою Docker Compose:
```bash
docker-compose up -d
```

### 3. Встановлення залежностей
Встановіть необхідні пакети в корені проєкту:
```bash
npm install
```

### 4. Налаштування Бази Даних (Enterprise підхід)
Згенеруйте клієнт Prisma та застосуйте міграції для збереження консистентної історії бази даних:
```bash
cd apps/api
npx prisma generate
npx prisma migrate dev
cd ../..
```

### 5. Запуск проєкту
Одночасний запуск NestJS API та Vite React Frontend:
```bash
npm run dev:all
```
- **Бекенд API**: `http://localhost:3000`
- **Фронтенд додаток**: `http://localhost:5173`

---

<div align="center">
  <p>Створено з ❤️ студентом КПІ</p>
</div>

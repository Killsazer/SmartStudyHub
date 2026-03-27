<div align="center">
  <h1>📘 Smart Study Hub</h1>
  <p>
    🇺🇸 <a href="README.md">English</a> | 🇺🇦 <b>Українська</b>
  </p>
  <p><strong>Enterprise-рівень Monorepo (NestJS + React) з ідеальною Clean Architecture та реалізацією 9 патернів GoF.</strong></p>

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

**Smart Study Hub** — це передова система управління навчальним процесом (LMS), розроблена як курсовий проєкт. Система демонструє високий рівень інженерної культури завдяки строгому дотриманню принципів **Clean Architecture** (Uncle Bob) та бездоганній реалізації **9 патернів проектування GoF**.

Проєкт побудовано як **Monorepo** (Yarn/NPM Workspaces), що містить потужний REST API бекенд та швидкий сучасний фронтенд з мінімалістичним дизайном у стилі Linear/Notion.

---

## 🏗 Архітектура (Clean Architecture)

Бекенд проєкту має строгий поділ на шари, гарантуючи повну незалежність бізнес-логіки від зовнішніх фреймворків:

1.  **Domain Layer**: Чисті сутності, інтерфейси репозиторіїв та ядро патернів проектування (нуль залежностей).
2.  **Application Layer**: Use Cases (сценарії використання), які оркеструють доменну логіку.
3.  **Infrastructure Layer**: Реалізації репозиторіїв (Prisma), підключення до бази даних та зовнішніх служб.
4.  **Presentation Layer**: REST контролери, DTO та HTTP маршрутизація.

**Frontend** виступає як "тонкий клієнт", що відповідає за складну візуалізацію даних та відправку намірів користувача до бекенду, де і відпрацьовують основні патерни.

---

## 🧩 Реалізовані патерни GoF (9/9)

<details>
<summary><strong>Породжувальні (Creational) - 3 патерни</strong></summary>

- **Factory Method**: `LessonFactory` — Інкапсулює логіку створення різних типів занять (Lecture, Lab, Seminar).
- **Builder**: `SubjectBuilder` — Забезпечує покрокову збірку складного об'єкта предмета разом із заняттями та завданнями.
- **Singleton**: `DeadlineNotificationManager` — Гарантує існування єдиного екземпляра менеджера для управління чергою сповіщень.

</details>

<details>
<summary><strong>Структурні (Structural) - 3 патерни</strong></summary>

- **Decorator**: `RecurringTaskDecorator` — Динамічно розширює функціонал завдань, автоматично створюючи наступне при завершенні поточного.
- **Facade**: `StudyHubFacade` — Надає єдиний, спрощений інтерфейс для складного процесу онбордингу нового користувача.
- **Composite**: `NoteComponent` — Деревоподібна структура нотаток з підтримкою нескінченної вкладеності, що рекурсивно рендериться на UI.

</details>

<details>
<summary><strong>Поведінкові (Behavioral) - 3 патерни</strong></summary>

- **Command**: `ChangeTaskStatusCommand` — Інкапсулює дію зміни статусу завдання як об'єкт, забезпечуючи надійну обробку подій. Візуалізується як інтерактивна Kanban-дошка.
- **Observer**: `TaskStatusNotifier` — Реактивний механізм сповіщення підсистем про зміну стану завдань.
- **Strategy**: `ITaskSortStrategy` — Дозволяє динамічно підміняти алгоритм сортування списку завдань (за дедлайном чи пріоритетом) безпосередньо з фронтенду.

</details>

---

## 🗂 Структура Monorepo

```ascii
kursach/
├── apps/
│   ├── api/                 # NestJS Бекенд (Clean Architecture)
│   │   ├── src/
│   │   │   ├── domain/      # Сутності та GoF Патерни
│   │   │   ├── application/ # Use Cases
│   │   │   ├── infra/       # Інфраструктура (Prisma)
│   │   │   └── presentation/# REST Контролери
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

## 🧪 Testing Flex

Проєкт демонструє серйозний інженерний підхід до забезпечення якості:

- **100% покриття тестами** критичної бізнес-логіки.
- **75 успішних тестів** сумарно.
- Глибоке **Unit-тестування** ізольованих компонентів та **E2E тестування** API ендпоінтів.
- Побудовано з використанням **Jest** та **Supertest**.

---

## 🛠 Швидкий старт

Виконайте ці кроки для локального запуску всієї екосистеми:

### 1. Запуск інфраструктури
Підніміть базу даних PostgreSQL за допомогою Docker Compose:
```bash
docker-compose up -d
```

### 2. Встановлення залежностей
Встановіть необхідні пакети в корені проєкту:
```bash
npm install
```

### 3. Налаштування Бази Даних (Prisma)
Згенеруйте клієнт Prisma та застосуйте схему до БД:
```bash
cd apps/api
npx prisma generate
npx prisma db push
cd ../..
```

### 4. Запуск проєкту
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

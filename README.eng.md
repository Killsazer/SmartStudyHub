<div align="center">
  <h1>📘 Smart Study Hub</h1>
  <p>
    🇺🇸 <b>English</b> | 🇺🇦 <a href="README.md">Українська</a>
  </p>
  <p><strong>Enterprise-grade Monorepo (NestJS + React) built with pristine Clean Architecture and 7 GoF Design Patterns.</strong></p>

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

## 🚀 Overview

**Smart Study Hub** is an advanced Learning Management System (LMS) developed as a capstone project. It showcases robust, scalable software engineering practices by strictly adhering to **Robert C. Martin's Clean Architecture** and cleanly implementing **7 Gang of Four (GoF) Design Patterns**.

The repository is structured as a **Yarn/NPM Monorepo**, containing a robust REST API backend and a fast, modern frontend client reminiscent of Linear/Notion aesthetics.

---

## 🏗 Architecture (Clean Architecture)

The backend strictly follows Clean Architecture principles, ensuring zero framework lock-in at the core domain layer:

1. **Domain Layer**: Pure business entities, repository interfaces, and core pattern logic (No dependencies).
2. **Application Layer**: Use Cases and services orchestrating domain logic.
3. **Infrastructure Layer**: Concrete repository implementations (Prisma), database drivers, and external services.
4. **Presentation Layer**: RESTful Controllers, DTOs, and HTTP routing.

The **Frontend** acts as a lightweight client, solely responsible for visualizing complex data structures and managing user interactions.

---

## 📦 Backend Modules

The project is divided into independent domain modules with strictly defined responsibilities:

- 🛡️ **Auth Module**: Secures the application, handling JWT authentication and user registration.
- 📚 **Subjects Module**: Manages educational subjects, serving as the root aggregation entity for schedules and tasks.
- 👨‍🏫 **Teachers Module**: Manages teacher profiles, contacts, and subject associations. Extracted as a separate module to allow flexible personnel management.
- 📅 **Schedule Module**: Handles the class schedule (lectures, labs, practices), linked to time slots, locations, and teachers.
- ✅ **Tasks Module**: A comprehensive task management system featuring Kanban board capabilities and deadlines.
- 📝 **Notes Module**: An advanced hierarchical note-taking system for subjects.
- 🚀 **Onboarding Module**: A specialized module for adapting new users. It orchestrates the creation of initial subjects, teachers, and tasks for a quick start.
- ⚙️ **Shared Module**: Common infrastructure: configuration, DB connection (Prisma), logging, and global exception handling.

---

## 🧩 GoF Design Patterns (7)

At the heart of the business logic lie classic design patterns, solving architectural challenges in an elegant way.

### Creational Patterns
1. **Factory Method** (`ScheduleSlotFactory` in `Schedule`):
   Encapsulates the instantiation logic for various schedule slot types (Lecture, Lab, Practice). Allows adding new class types without altering existing code.
2. **Builder** (`SubjectBuilder` in `Subjects`):
   Provides step-by-step construction of a complex `Subject` object along with its initial schedule slots and tasks.

### Structural Patterns
3. **Decorator** (`RecurringTaskDecorator` and `OverdueTaskDecorator` in `Tasks`):
   An architectural "flex" of the project: the pattern is applied at two different layers. At the deep domain logic layer (`RecurringTaskDecorator`), it generates subsequent occurrences upon task completion. At the Application/View layer (`OverdueTaskDecorator`), it dynamically attaches an "OVERDUE" flag without polluting the database schema with redundant state.
4. **Facade** (`OnboardingFacade` in `Onboarding`):
   Provides a unified, simplified interface for the complex onboarding process, hiding interactions with the Subjects, Teachers, Schedule, and Tasks modules.
5. **Composite** (`NoteComponent` in `Notes`):
   Allows representing notes as a deeply nested tree structure (sections containing blocks of content) with infinite nesting support.

### Behavioral Patterns
6. **Command** (`ChangeTaskStatusCommand` in `Tasks`):
   Encapsulates the action of changing a task's status as an object. This ensures robust event handling when moving cards on the interactive Kanban board.
7. **Strategy** (`ITaskSortStrategy` in `Tasks`):
   Allows dynamic interchangeability of sorting algorithms (e.g., by deadline vs. by priority) directly controlled via frontend interactions.

---

## 🗂 Monorepo Structure

```ascii
kursach/
├── apps/
│   ├── api/                 # NestJS Backend (Clean Architecture)
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
│   └── web/                 # React + Vite Frontend
│       ├── src/
│       │   ├── pages/       # Route components
│       │   ├── components/  # Reusable UI elements
│       │   └── ...
│       └── ...
├── package.json             # Root monorepo config
└── docker-compose.yml       # Infrastructure orchestration
```

---

## 🧪 Quality Assurance

Quality is a fundamental pillar of this project:

- **100% Test Coverage** on critical business logic and design patterns.
- **144 Passing Tests** across the suite.
- Comprehensive **Unit Testing** for isolated components and **E2E Testing** for API endpoints.
- Powered by **Jest** and **Supertest**.

---

## 🛠 Quick Start

Follow these steps to spin up the entire ecosystem locally:

### 1. Environment Setup
Before starting the infrastructure, configure the backend environment. Navigate to the `apps/api` directory, copy the `.env.example` file to `.env`, and provide your `DATABASE_URL` along with JWT secrets:
```bash
cp apps/api/.env.example apps/api/.env
```

### 2. Start Infrastructure
Boot up the PostgreSQL database using Docker Compose:
```bash
docker-compose up -d
```

### 3. Install Dependencies
Install all required packages from the root of the monorepo:
```bash
npm install
```

### 4. Database Setup (Enterprise Approach)
Generate the Prisma client and run migrations to maintain a consistent database history:
```bash
cd apps/api
npx prisma generate
npx prisma migrate dev
cd ../..
```

### 5. Launch the Application
Start both the NestJS API and the Vite React Frontend concurrently:
```bash
npm run dev:all
```
- **Backend API**: `http://localhost:3000`
- **Frontend App**: `http://localhost:5173`

---

<div align="center">
  <p>Built with ❤️ by a KPI Student</p>
</div>

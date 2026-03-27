<div align="center">
  <h1>📘 Smart Study Hub</h1>
  <p>
    🇺🇸 <b>English</b> | 🇺🇦 <a href="README.md">Українська</a>
  </p>
  <p><strong>Enterprise-grade Monorepo (NestJS + React) built with pristine Clean Architecture and 9 GoF Design Patterns.</strong></p>

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

**Smart Study Hub** is an advanced Learning Management System (LMS) developed as a capstone project. It showcases robust, scalable software engineering practices by strictly adhering to **Robert C. Martin's Clean Architecture** and cleanly implementing **9 Gang of Four (GoF) Design Patterns**.

The repository is structured as a **Yarn/NPM Monorepo**, containing a robust REST API backend and a fast, modern frontend client reminiscent of Linear/Notion aesthetics.

---

## 🏗 Architecture (Clean Architecture)

The backend strictly follows Clean Architecture principles, ensuring zero framework lock-in at the core domain layer:

1. **Domain Layer**: Pure business entities, repository interfaces, and core pattern logic (No dependencies).
2. **Application Layer**: Use Cases orchestrating domain logic.
3. **Infrastructure Layer**: Concrete repository implementations (Prisma), database drivers, and external services.
4. **Presentation Layer**: RESTful Controllers, DTOs, and HTTP routing.

The **Frontend** acts as a lightweight client, solely responsible for visualizing complex data structures and managing user interactions that orchestrate the backend patterns.

---

## 🧩 GoF Design Patterns (9/9)

<details>
<summary><strong>Creational Patterns (3)</strong></summary>

- **Factory Method**: `LessonFactory` — Encapsulates the instantiation logic for various lesson types (Lecture, Lab, Seminar).
- **Builder**: `SubjectBuilder` — Step-by-step construction of complex subject configurations including lessons and tasks.
- **Singleton**: `DeadlineNotificationManager` — A single, globally accessible instance managing the notification queue and WebSocket dispatchers.

</details>

<details>
<summary><strong>Structural Patterns (3)</strong></summary>

- **Decorator**: `RecurringTaskDecorator` — Dynamically attaches behavior to tasks, automatically generating the next occurrence upon completion.
- **Facade**: `StudyHubFacade` — Provides a simplified, unified interface for complex user onboarding workflows.
- **Composite**: `NoteComponent` — Implements a recursive tree structure for hierarchical note-taking (sections containing blocks, containing text), visually rendered as a deeply nested tree on the frontend.

</details>

<details>
<summary><strong>Behavioral Patterns (3)</strong></summary>

- **Command**: `ChangeTaskStatusCommand` — Encapsulates state transitions as command objects, enabling complex workflows like undo/redo. Represented as interactive Kanban cards on the UI.
- **Observer**: `TaskStatusNotifier` — Implements a publish-subscribe mechanism to notify dependent subsystems of status changes.
- **Strategy**: `ITaskSortStrategy` — Allows dynamic interchangeability of sorting algorithms (by deadline vs. by priority) directly controlled via UI interactions.

</details>

---

## 🗂 Monorepo Structure

```ascii
kursach/
├── apps/
│   ├── api/                 # NestJS Backend (Clean Architecture)
│   │   ├── src/
│   │   │   ├── domain/      # Core entities & GoF Patterns
│   │   │   ├── application/ # Use Cases
│   │   │   ├── infra/       # Prisma & Adapters
│   │   │   └── presentation/# REST Controllers
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

## 🧪 Testing Flex

Quality assurance is a fundamental pillar of this project.

- **100% Test Coverage** on critical business logic.
- **75 Passing Tests** across the suite.
- Comprehensive **Unit Testing** for isolated components and **E2E Testing** for API endpoint validation.
- Powered by **Jest** and **Supertest**.

---

## 🛠 Quick Start

Follow these steps to spin up the entire ecosystem locally.

### 1. Start Infrastructure

Boot up the PostgreSQL database using Docker Compose:

```bash
docker-compose up -d
```

### 2. Install Dependencies

Install all required packages from the root of the monorepo:

```bash
npm install
```

### 3. Database Setup (Prisma)

Generate the Prisma client and push the schema to your local database:

```bash
cd apps/api
npx prisma generate
npx prisma db push
cd ../..
```

### 4. Launch the Application

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

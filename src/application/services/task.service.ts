// File: src/application/services/task.service.ts
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { ITaskRepository } from '../../domain/repositories/task.repository.interface';
import { TaskEntity, TaskStatus, TaskPriority } from '../../domain/entities/task.entity';
import { CreateTaskDto } from '../../presentation/dtos/create-task.dto';
import { ChangeTaskStatusCommand } from '../../domain/patterns/command/change-task-status.command';
import { TaskStatusNotifier } from '../../domain/patterns/observer/task-status.notifier';
import { DeadlineAlertObserver } from '../../domain/patterns/observer/deadline-alert.observer';
import { TaskSortContext } from '../../domain/patterns/strategy/task-sort.context';
import { SortByDeadlineStrategy } from '../../domain/patterns/strategy/sort-by-deadline.strategy';
import { SortByPriorityStrategy } from '../../domain/patterns/strategy/sort-by-priority.strategy';
import { SortByTitleStrategy } from '../../domain/patterns/strategy/sort-by-title.strategy';

@Injectable()
export class TaskService {
  private statusNotifier: TaskStatusNotifier;

  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepo: ITaskRepository
  ) {
    // Патерн Observer: Ініціалізуємо і підписуємо сповіщувач один раз при піднятті сервісу
    this.statusNotifier = new TaskStatusNotifier();
    this.statusNotifier.attach(new DeadlineAlertObserver());
  }

  async createTask(userId: string, dto: CreateTaskDto): Promise<TaskEntity> {
    const task = new TaskEntity(
      `task-${Date.now()}`,
      dto.title,
      TaskStatus.TODO,
      dto.priority || TaskPriority.MEDIUM,
      userId,
      dto.description,
      dto.deadline ? new Date(dto.deadline) : undefined,
      dto.subjectId
    );
    
    // Передаємо в порт (Інфраструктуру)
    await this.taskRepo.save(task);
    return task;
  }

  async changeTaskStatus(taskId: string, newStatus: TaskStatus): Promise<void> {
    // 1. Отримуємо сутність
    const task = await this.taskRepo.findById(taskId);
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    // 2. Використовуємо Command Pattern (GoF) для зміни статусу.
    // Це забезпечує можливість легко реалізувати undo() у майбутньому
    const command = new ChangeTaskStatusCommand(task, newStatus);
    command.execute();

    // 3. Зберігаємо змінений об'єкт за допомогою репозиторію
    await this.taskRepo.save(task);

    // 4. Патерн Observer (GoF): відправляємо подію спостерігачам.
    // Вони самостійно відфільтрують статуси та виконають логіку (наприклад якщо DONE)
    this.statusNotifier.notify(task);
    
    console.log(`[TaskService] Re-hydrated task '${taskId}', changed status and notified observers.`);
  }

  async getUserTasks(userId: string, sortType?: string): Promise<TaskEntity[]> {
    // 1. Отримуємо сирі дані з БД
    const tasks = await this.taskRepo.findByUserId(userId);
    
    // Якщо сортування не задано або масив порожній, повертаємо як є
    if (!sortType || tasks.length === 0) return tasks;

    // 2. Визначаємо потрібну стратегію
    let strategy;
    switch (sortType.toLowerCase()) {
      case 'deadline':
        strategy = new SortByDeadlineStrategy();
        break;
      case 'priority':
        strategy = new SortByPriorityStrategy();
        break;
      case 'title':
        strategy = new SortByTitleStrategy();
        break;
      default:
        // Невідомий тип сортування, повертаємо як є
        return tasks;
    }

    // 3. Застосовуємо шаблон Strategy (GoF) для делегування логіки сортування
    const context = new TaskSortContext(strategy);
    return context.executeStrategy(tasks);
  }
}

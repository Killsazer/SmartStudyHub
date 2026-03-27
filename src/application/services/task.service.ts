// File: src/application/services/task.service.ts
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { ITaskRepository } from '../../domain/repositories/task.repository.interface';
import { TaskEntity, TaskStatus, TaskPriority } from '../../domain/entities/task.entity';
import { CreateTaskDto } from '../../presentation/dtos/create-task.dto';
import { ChangeTaskStatusCommand } from '../../domain/patterns/command/change-task-status.command';
import { TaskStatusNotifier } from '../../domain/patterns/observer/task-status.notifier';
import { DeadlineAlertObserver } from '../../domain/patterns/observer/deadline-alert.observer';

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
}

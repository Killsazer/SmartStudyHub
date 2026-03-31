// File: src/tasks/application/task.service.ts
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { ITaskRepository } from '../domain/task.repository.interface';
import { TaskEntity, TaskStatus, TaskPriority } from '../domain/task.entity';
import { CreateTaskDto } from '../presentation/create-task.dto';
import { UpdateTaskDto } from '../presentation/update-task.dto';
import { ChangeTaskStatusCommand } from '../domain/patterns/command/change-task-status.command';
import { TaskStatusNotifier } from '../domain/patterns/observer/task-status.notifier';
import { DeadlineAlertObserver } from '../domain/patterns/observer/deadline-alert.observer';
import { TaskSortContext } from '../domain/patterns/strategy/task-sort.context';
import { ITaskSortStrategy } from '../domain/patterns/strategy/task-sort.strategy';
import { SortByDeadlineStrategy } from '../domain/patterns/strategy/sort-by-deadline.strategy';
import { SortByPriorityStrategy } from '../domain/patterns/strategy/sort-by-priority.strategy';
import { SortByTitleStrategy } from '../domain/patterns/strategy/sort-by-title.strategy';

@Injectable()
export class TaskService {
  private readonly statusNotifier: TaskStatusNotifier;

  /**
   * Map-based strategy lookup (KISS).
   * Adding a new sort strategy requires only one new entry here — Open/Closed principle.
   */
  private readonly strategyMap: ReadonlyMap<string, ITaskSortStrategy> = new Map([
    ['deadline', new SortByDeadlineStrategy()],
    ['priority', new SortByPriorityStrategy()],
    ['title', new SortByTitleStrategy()],
  ]);

  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepo: ITaskRepository
  ) {
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

    await this.taskRepo.save(task);
    return task;
  }

  async changeTaskStatus(taskId: string, newStatus: TaskStatus): Promise<void> {
    const task = await this.taskRepo.findById(taskId);
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    const command = new ChangeTaskStatusCommand(task, newStatus);
    command.execute();

    await this.taskRepo.save(task);
    this.statusNotifier.notify(task);
  }

  async updateTask(userId: string, taskId: string, dto: UpdateTaskDto): Promise<TaskEntity> {
    const task = await this.taskRepo.findById(taskId);
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    if (dto.title !== undefined) task.title = dto.title;
    if (dto.description !== undefined) task.description = dto.description;
    if (dto.priority !== undefined) task.priority = dto.priority;
    if (dto.deadline !== undefined) task.deadline = dto.deadline ? new Date(dto.deadline) : undefined;

    await this.taskRepo.save(task);
    return task;
  }

  async deleteTask(userId: string, taskId: string): Promise<void> {
    const task = await this.taskRepo.findById(taskId);
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }
    await this.taskRepo.delete(taskId);
  }

  async getUserTasks(userId: string, sortType?: string, subjectId?: string): Promise<TaskEntity[]> {
    let tasks = await this.taskRepo.findByUserId(userId);

    if (subjectId) {
      tasks = tasks.filter(t => t.subjectId === subjectId);
    }

    if (!sortType || tasks.length === 0) return tasks;

    const strategy = this.strategyMap.get(sortType.toLowerCase());
    if (!strategy) return tasks;

    const context = new TaskSortContext(strategy);
    return context.executeStrategy(tasks);
  }
}

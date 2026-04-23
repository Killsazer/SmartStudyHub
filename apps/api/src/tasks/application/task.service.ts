import { Injectable, Inject, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import type { ITaskRepository } from '../domain/task.repository.interface';
import { CommandHistoryManager } from '../domain/patterns/command/command-history.manager';
import { TaskEntity, TaskStatus, TaskPriority, ITask } from '../domain/task.entity';
import { CreateTaskDto } from '../presentation/dto/create-task.dto';
import { UpdateTaskDto } from '../presentation/dto/update-task.dto';
import { ChangeTaskStatusCommand } from '../domain/patterns/command/change-task-status.command';
import { TaskSortContext } from '../domain/patterns/strategy/task-sort.context';
import { ITaskSortStrategy, SortByDeadlineStrategy, SortByPriorityStrategy, SortByTitleStrategy } from '../domain/patterns/strategy/task-sort.strategies';
import { randomUUID } from 'crypto';
import { OverdueTaskDecorator } from '../domain/patterns/decorator/overdue-task.decorator';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  private readonly strategyMap: ReadonlyMap<string, ITaskSortStrategy> = new Map([
    ['deadline', new SortByDeadlineStrategy()],
    ['priority', new SortByPriorityStrategy()],
    ['title', new SortByTitleStrategy()],
  ]);

  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepo: ITaskRepository,

    @Inject('CommandHistoryManager')
    private readonly historyManager: CommandHistoryManager,
  ) {}

  async createTask(userId: string, dto: CreateTaskDto): Promise<TaskEntity> {
    const task = new TaskEntity({
      id: randomUUID(),
      title: dto.title,
      status: TaskStatus.TODO,
      priority: dto.priority || TaskPriority.MEDIUM,
      userId,
      description: dto.description,
      deadline: dto.deadline ? new Date(dto.deadline) : undefined,
      subjectId: dto.subjectId,
      recurrenceDays: dto.recurrenceDays,
    });

    await this.taskRepo.save(task);
    this.logger.log(`Created task '${dto.title}' for user: ${userId}`);
    return task;
  }

  async updateTaskStatus(userId: string, taskId: string, newStatus: TaskStatus): Promise<void> {
    const task = await this.checkAccess(taskId, userId);
    if (task.status === newStatus) return;

    const command = new ChangeTaskStatusCommand(task, newStatus, this.taskRepo);
    await this.historyManager.execute(userId, command);
  }

  async undoLastStatusChange(userId: string): Promise<void> {
    await this.historyManager.undo(userId);
  }

  async updateTask(userId: string, taskId: string, dto: UpdateTaskDto): Promise<TaskEntity> {
    const task = await this.checkAccess(taskId, userId);

    if (dto.title !== undefined) task.title = dto.title;
    if (dto.description !== undefined) task.description = dto.description;
    if (dto.priority !== undefined) task.priority = dto.priority;
    if (dto.deadline !== undefined) task.deadline = dto.deadline ? new Date(dto.deadline) : undefined;
    if (dto.recurrenceDays !== undefined) task.recurrenceDays = dto.recurrenceDays;

    await this.taskRepo.save(task);
    return task;
  }

  async deleteTask(userId: string, taskId: string): Promise<void> {
    await this.checkAccess(taskId, userId);
    await this.taskRepo.delete(taskId);
  }

  async getUserTasks(userId: string, sortType?: string, subjectId?: string): Promise<ITask[]> {
    let tasks = await this.taskRepo.findByUserId(userId);

    if (subjectId) {
      tasks = tasks.filter(t => t.subjectId === subjectId);
    }

    let resultTasks = tasks;

    if (sortType && tasks.length > 0) {
      const strategy = this.strategyMap.get(sortType.toLowerCase());
      if (strategy) {
        const context = new TaskSortContext(strategy);
        resultTasks = context.executeStrategy(tasks);
      }
    }

    return resultTasks.map(task => new OverdueTaskDecorator(task));
  }

  private async checkAccess(taskId: string, userId: string): Promise<TaskEntity> {
    const task = await this.taskRepo.findById(taskId);
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    if (task.userId !== userId) {
      throw new ForbiddenException('Access denied: You can only modify your own tasks');
    }

    return task;
  }
}
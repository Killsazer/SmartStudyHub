import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { ITaskRepository } from '../domain/task.repository.interface';
import { TaskEntity, TaskStatus, TaskPriority } from '../domain/task.entity';
import { CreateTaskDto } from '../presentation/dto/create-task.dto';
import { UpdateTaskDto } from '../presentation/dto/update-task.dto';
import { ChangeTaskStatusCommand } from '../domain/patterns/command/change-task-status.command';
import { TaskSortContext } from '../domain/patterns/strategy/task-sort.context';
import { ITaskSortStrategy, SortByDeadlineStrategy, SortByPriorityStrategy, SortByTitleStrategy } from '../domain/patterns/strategy/task-sort.strategies';
import { randomUUID } from 'crypto';

@Injectable()
export class TaskService {
  //cтворюємо мапу доступних стратегій
  private readonly strategyMap: ReadonlyMap<string, ITaskSortStrategy> = new Map([
    ['deadline', new SortByDeadlineStrategy()],
    ['priority', new SortByPriorityStrategy()],
    ['title', new SortByTitleStrategy()],
  ]);

  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepo: ITaskRepository
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
      subjectId: dto.subjectId
    });

    await this.taskRepo.save(task);
    return task;
  }

  async updateTaskStatus(userId: string, taskId: string, newStatus: TaskStatus): Promise<void> {
    const task = await this.checkAccess(taskId, userId);

    const command = new ChangeTaskStatusCommand(task, newStatus);
    command.execute();

    await this.taskRepo.save(task);
  }

  async updateTask(userId: string, taskId: string, dto: UpdateTaskDto): Promise<TaskEntity> {
    const task = await this.checkAccess(taskId, userId);

    if (dto.title !== undefined) task.title = dto.title;
    if (dto.description !== undefined) task.description = dto.description;
    if (dto.priority !== undefined) task.priority = dto.priority;
    if (dto.deadline !== undefined) task.deadline = dto.deadline ? new Date(dto.deadline) : undefined;

    await this.taskRepo.save(task);
    return task;
  }

  async deleteTask(userId: string, taskId: string): Promise<void> {
    await this.checkAccess(taskId, userId);

    await this.taskRepo.delete(taskId);
  }

  async getUserTasks(userId: string, sortType?: string, subjectId?: string): Promise<TaskEntity[]> {
    let tasks = await this.taskRepo.findByUserId(userId);

    if (subjectId) {
      tasks = tasks.filter(t => t.subjectId === subjectId);
    }

    if (!sortType || tasks.length === 0) return tasks;

    const strategy = this.strategyMap.get(sortType.toLowerCase()); //шукаємо отриману стратегію в map
    if (!strategy) return tasks;

    const context = new TaskSortContext(strategy); //створюємо контекст і передаємо йому стратегію
    return context.executeStrategy(tasks); //виконуємо стратегію
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

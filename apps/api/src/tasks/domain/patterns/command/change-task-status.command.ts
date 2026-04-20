import { ICommand } from './command.interface';
import { TaskEntity, TaskStatus } from '../../task.entity';
import { ITaskRepository } from '../../task.repository.interface';
import { RecurringTaskDecorator } from '../decorator/recurring-task.decorator';

export class ChangeTaskStatusCommand implements ICommand {
  private previousStatus?: TaskStatus; 
  private generatedRecurringTaskId?: string; 

  constructor(
    private readonly task: TaskEntity,
    private readonly newStatus: TaskStatus,
    private readonly taskRepo: ITaskRepository,
  ) {}

  async execute(): Promise<void> {
    this.previousStatus = this.task.status;
    
    // Якщо завершуємо повторювану таску - юзаємо декоратор
    if (this.newStatus === TaskStatus.DONE && this.task.recurrenceDays) {
      const decorated = new RecurringTaskDecorator(this.task, this.task.recurrenceDays);
      const nextTask = decorated.completeTask();
      
      if (nextTask) {
        await this.taskRepo.save(nextTask as TaskEntity);
        this.generatedRecurringTaskId = nextTask.id; 
      }
    } else {
      this.task.status = this.newStatus;
    }
    
    await this.taskRepo.save(this.task);
  }

  async undo(): Promise<void> {
    if (!this.previousStatus) {
      console.warn('Неможливо відмінити команду, яка ще не виконувалась');
      return;
    }
    
    this.task.status = this.previousStatus;
    await this.taskRepo.save(this.task); 

    if (this.generatedRecurringTaskId) {
      await this.taskRepo.delete(this.generatedRecurringTaskId);
      this.generatedRecurringTaskId = undefined;
    }
  }
}

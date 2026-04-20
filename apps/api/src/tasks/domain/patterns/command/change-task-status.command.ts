import { ICommand } from './command.interface';
import { TaskEntity, TaskStatus } from '../../task.entity';
import { ITaskRepository } from '../../task.repository.interface';

export class ChangeTaskStatusCommand implements ICommand {
  private previousStatus?: TaskStatus; 

  constructor(
    private readonly task: TaskEntity,
    private readonly newStatus: TaskStatus,
    private readonly taskRepo: ITaskRepository,
  ) {}

  async execute(): Promise<void> {
    this.previousStatus = this.task.status; // Запам'ятовуємо стан для Undo
    this.task.status = this.newStatus;
    await this.taskRepo.save(this.task);
  }

  //Команда відкочує таску
  async undo(): Promise<void> {
    if (!this.previousStatus) {
      console.warn('Неможливо відмінити команду, яка ще не виконувалась');
      return;
    }
    
    this.task.status = this.previousStatus;
    await this.taskRepo.save(this.task); // Зберігаємо старий статус назад у БД
  }
}

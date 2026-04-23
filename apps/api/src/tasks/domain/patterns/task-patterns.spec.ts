import { ChangeTaskStatusCommand } from './command/change-task-status.command';
import { CommandHistoryManager } from './command/command-history.manager';
import { TaskEntity, TaskStatus, TaskPriority } from '../task.entity';
import { ITaskRepository } from '../task.repository.interface';
import { RecurringTaskDecorator, TaskDecorator } from './decorator/recurring-task.decorator';
import { TaskSortContext } from './strategy/task-sort.context';
import { SortByDeadlineStrategy, SortByPriorityStrategy, SortByTitleStrategy } from './strategy/task-sort.strategies';

const createTask = (overrides: Partial<import('../task.entity').TaskProps> = {}): TaskEntity =>
  new TaskEntity({
    id: 't1',
    title: 'Test task',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    userId: 'u1',
    ...overrides,
  });

const createMockRepo = (): jest.Mocked<ITaskRepository> => ({
  save: jest.fn().mockImplementation(async (t) => t),
  delete: jest.fn().mockResolvedValue(undefined),
  findById: jest.fn(),
  findByUserId: jest.fn(),
});

describe('ChangeTaskStatusCommand', () => {
  let mockRepo: jest.Mocked<ITaskRepository>;

  beforeEach(() => {
    mockRepo = createMockRepo();
  });

  it('✅ execute() should change task status and save', async () => {
    const task = createTask();
    const command = new ChangeTaskStatusCommand(task, TaskStatus.IN_PROGRESS, mockRepo);

    await command.execute();

    expect(task.status).toBe(TaskStatus.IN_PROGRESS);
    expect(mockRepo.save).toHaveBeenCalledWith(task);
  });

  it('✅ undo() should revert task status to previous value', async () => {
    const task = createTask();
    const command = new ChangeTaskStatusCommand(task, TaskStatus.DONE, mockRepo);

    await command.execute();
    expect(task.status).toBe(TaskStatus.DONE);

    await command.undo();
    expect(task.status).toBe(TaskStatus.TODO);
    expect(mockRepo.save).toHaveBeenCalledTimes(2);
  });

  it('✅ undo() before execute() should be a no-op', async () => {
    const task = createTask();
    const command = new ChangeTaskStatusCommand(task, TaskStatus.DONE, mockRepo);

    await command.undo();

    expect(task.status).toBe(TaskStatus.TODO);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('✅ should use Decorator for recurring task completion', async () => {
    const task = createTask({ recurrenceDays: 7 });
    const command = new ChangeTaskStatusCommand(task, TaskStatus.DONE, mockRepo);

    await command.execute();

    expect(task.status).toBe(TaskStatus.DONE);
    expect(mockRepo.save).toHaveBeenCalledTimes(2);

    const generatedTask = mockRepo.save.mock.calls[0][0];
    expect(generatedTask.status).toBe(TaskStatus.TODO);
    expect(generatedTask.id).not.toBe('t1');
  });

  it('✅ undo() should delete generated recurring task', async () => {
    const task = createTask({ recurrenceDays: 7 });
    const command = new ChangeTaskStatusCommand(task, TaskStatus.DONE, mockRepo);

    await command.execute();
    const generatedId = mockRepo.save.mock.calls[0][0].id;

    await command.undo();

    expect(task.status).toBe(TaskStatus.TODO);
    expect(mockRepo.delete).toHaveBeenCalledWith(generatedId);
  });

  it('✅ non-DONE status change should not trigger Decorator', async () => {
    const task = createTask({ recurrenceDays: 7 });
    const command = new ChangeTaskStatusCommand(task, TaskStatus.IN_PROGRESS, mockRepo);

    await command.execute();

    expect(task.status).toBe(TaskStatus.IN_PROGRESS);
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });
});

describe('CommandHistoryManager', () => {
  let manager: CommandHistoryManager;
  let mockRepo: jest.Mocked<ITaskRepository>;

  beforeEach(() => {
    manager = new CommandHistoryManager();
    mockRepo = createMockRepo();
  });

  it('✅ execute() should run command and store in history', async () => {
    const task = createTask();
    const command = new ChangeTaskStatusCommand(task, TaskStatus.IN_PROGRESS, mockRepo);

    await manager.execute('u1', command);

    expect(task.status).toBe(TaskStatus.IN_PROGRESS);
  });

  it('✅ undo() should revert the most recent command', async () => {
    const task = createTask();
    await manager.execute('u1', new ChangeTaskStatusCommand(task, TaskStatus.IN_PROGRESS, mockRepo));
    await manager.execute('u1', new ChangeTaskStatusCommand(task, TaskStatus.DONE, mockRepo));

    expect(task.status).toBe(TaskStatus.DONE);

    await manager.undo('u1');
    expect(task.status).toBe(TaskStatus.IN_PROGRESS);
  });

  it('❌ undo() on empty history should throw', async () => {
    await expect(manager.undo('u1')).rejects.toThrow('Nothing to undo');
  });

  it('✅ should maintain separate histories per user', async () => {
    const task1 = createTask({ id: 't1', userId: 'u1' });
    const task2 = createTask({ id: 't2', userId: 'u2' });

    await manager.execute('u1', new ChangeTaskStatusCommand(task1, TaskStatus.DONE, mockRepo));
    await manager.execute('u2', new ChangeTaskStatusCommand(task2, TaskStatus.IN_PROGRESS, mockRepo));

    await manager.undo('u1');
    expect(task1.status).toBe(TaskStatus.TODO);
    expect(task2.status).toBe(TaskStatus.IN_PROGRESS);
  });

  it('✅ should limit history to 10 commands', async () => {
    const task = createTask();
    for (let i = 0; i < 12; i++) {
      await manager.execute('u1', new ChangeTaskStatusCommand(task, TaskStatus.IN_PROGRESS, mockRepo));
      task.status = TaskStatus.TODO;
    }

    let undoCount = 0;
    while (true) {
      try {
        await manager.undo('u1');
        undoCount++;
      } catch {
        break;
      }
    }
    expect(undoCount).toBe(10);
  });
});

describe('RecurringTaskDecorator', () => {
  it('✅ completeTask() should mark original DONE and return new TODO task', () => {
    const task = createTask({ deadline: new Date('2026-06-15') });
    const decorator = new RecurringTaskDecorator(task, 7);

    const newTask = decorator.completeTask();

    expect(task.status).toBe(TaskStatus.DONE);
    expect(newTask).not.toBeNull();
    expect(newTask!.status).toBe(TaskStatus.TODO);
    expect(newTask!.id).not.toBe(task.id);
  });

  it('✅ should calculate next deadline by adding recurrenceDays', () => {
    const task = createTask({ deadline: new Date('2026-06-15') });
    const decorator = new RecurringTaskDecorator(task, 14);

    const newTask = decorator.completeTask();

    expect(newTask!.deadline!.toISOString().slice(0, 10)).toBe('2026-06-29');
  });

  it('✅ should preserve recurrenceDays in generated task', () => {
    const task = createTask({ recurrenceDays: 7 });
    const decorator = new RecurringTaskDecorator(task, 7);

    const newTask = decorator.completeTask();

    expect(newTask!.recurrenceDays).toBe(7);
  });

  it('✅ decorator should transparently delegate properties from wrappee', () => {
    const task = createTask({ description: 'desc', subjectId: 'subj-1' });
    const decorator = new RecurringTaskDecorator(task, 7);

    expect(decorator.id).toBe('t1');
    expect(decorator.title).toBe('Test task');
    expect(decorator.status).toBe(TaskStatus.TODO);
    expect(decorator.priority).toBe(TaskPriority.MEDIUM);
    expect(decorator.userId).toBe('u1');
    expect(decorator.description).toBe('desc');
    expect(decorator.subjectId).toBe('subj-1');
  });

  it('✅ setter delegation should mutate wrappee', () => {
    const task = createTask();
    const decorator = new RecurringTaskDecorator(task, 7);

    decorator.title = 'Changed';
    decorator.status = TaskStatus.IN_PROGRESS;

    expect(task.title).toBe('Changed');
    expect(task.status).toBe(TaskStatus.IN_PROGRESS);
  });
});

describe('Strategy Pattern — Sorting', () => {
  const createTasks = () => [
    createTask({ id: '1', title: 'Beta', priority: TaskPriority.LOW, deadline: new Date('2026-12-01') }),
    createTask({ id: '2', title: 'Alpha', priority: TaskPriority.HIGH, deadline: new Date('2026-06-01') }),
    createTask({ id: '3', title: 'Gamma', priority: TaskPriority.MEDIUM, deadline: new Date('2026-09-01') }),
  ];

  it('✅ SortByDeadline — nearest deadline first', () => {
    const context = new TaskSortContext(new SortByDeadlineStrategy());
    const sorted = context.executeStrategy(createTasks());

    expect(sorted[0].id).toBe('2');
    expect(sorted[1].id).toBe('3');
    expect(sorted[2].id).toBe('1');
  });

  it('✅ SortByPriority — highest priority first', () => {
    const context = new TaskSortContext(new SortByPriorityStrategy());
    const sorted = context.executeStrategy(createTasks());

    expect(sorted[0].priority).toBe(TaskPriority.HIGH);
    expect(sorted[1].priority).toBe(TaskPriority.MEDIUM);
    expect(sorted[2].priority).toBe(TaskPriority.LOW);
  });

  it('✅ SortByTitle — alphabetical order', () => {
    const context = new TaskSortContext(new SortByTitleStrategy());
    const sorted = context.executeStrategy(createTasks());

    expect(sorted[0].title).toBe('Alpha');
    expect(sorted[1].title).toBe('Beta');
    expect(sorted[2].title).toBe('Gamma');
  });

  it('✅ should handle tasks without deadlines (pushed to end)', () => {
    const tasks = [
      createTask({ id: '1', title: 'No deadline' }),
      createTask({ id: '2', title: 'Has deadline', deadline: new Date('2026-01-01') }),
    ];

    const context = new TaskSortContext(new SortByDeadlineStrategy());
    const sorted = context.executeStrategy(tasks);

    expect(sorted[0].id).toBe('2');
    expect(sorted[1].id).toBe('1');
  });

  it('✅ should not mutate original array', () => {
    const tasks = createTasks();
    const originalFirstId = tasks[0].id;

    const context = new TaskSortContext(new SortByTitleStrategy());
    context.executeStrategy(tasks);

    expect(tasks[0].id).toBe(originalFirstId);
  });

  it('✅ should handle empty array', () => {
    const context = new TaskSortContext(new SortByDeadlineStrategy());
    const sorted = context.executeStrategy([]);

    expect(sorted).toEqual([]);
  });
});

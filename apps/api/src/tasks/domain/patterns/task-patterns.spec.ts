// File: src/tasks/domain/patterns/task-patterns.spec.ts
// Covers: Command, CommandHistory, Observer, Decorator (Recurring), Singleton
import { TaskEntity, TaskStatus, TaskPriority } from '../task.entity';
import { ChangeTaskStatusCommand } from './command/change-task-status.command';
import { CommandHistory } from './command/command-history.manager';
import { TaskStatusNotifier } from './observer/task-status.notifier';
import { IObserver } from './observer/observer.interfaces';
import { RecurringTaskDecorator } from './decorator/recurring-task.decorator';
import { DeadlineNotificationManager } from './observer/deadline-notification.manager';

// ═══════════════════════════════════════════════════════════════
// COMMAND PATTERN
// ═══════════════════════════════════════════════════════════════

describe('ChangeTaskStatusCommand', () => {
  let task: TaskEntity;

  beforeEach(() => {
    task = new TaskEntity('t1', 'Homework', TaskStatus.TODO, TaskPriority.HIGH, 'u1');
  });

  it('✅ execute() should change task status to newStatus', () => {
    const command = new ChangeTaskStatusCommand(task, TaskStatus.IN_PROGRESS);

    command.execute();

    expect(task.status).toBe(TaskStatus.IN_PROGRESS);
  });

  it('✅ undo() should revert task status to previous value', () => {
    const command = new ChangeTaskStatusCommand(task, TaskStatus.DONE);

    command.execute();
    expect(task.status).toBe(TaskStatus.DONE);

    command.undo();
    expect(task.status).toBe(TaskStatus.TODO);
  });

  it('🔄 undo() before execute() should not crash (no-op)', () => {
    const command = new ChangeTaskStatusCommand(task, TaskStatus.DONE);

    command.undo(); // Should just log a warning, not throw

    expect(task.status).toBe(TaskStatus.TODO); // Unchanged
  });

  it('✅ sequential execute-undo cycle should be idempotent', () => {
    const cmd1 = new ChangeTaskStatusCommand(task, TaskStatus.IN_PROGRESS);
    const cmd2 = new ChangeTaskStatusCommand(task, TaskStatus.DONE);

    cmd1.execute();                     // TODO → IN_PROGRESS
    expect(task.status).toBe(TaskStatus.IN_PROGRESS);

    cmd2.execute();                     // IN_PROGRESS → DONE
    expect(task.status).toBe(TaskStatus.DONE);

    cmd2.undo();                        // DONE → IN_PROGRESS
    expect(task.status).toBe(TaskStatus.IN_PROGRESS);

    cmd1.undo();                        // IN_PROGRESS → TODO
    expect(task.status).toBe(TaskStatus.TODO);
  });
});

describe('CommandHistory', () => {
  let history: CommandHistory;
  let task: TaskEntity;

  beforeEach(() => {
    history = new CommandHistory();
    task = new TaskEntity('t1', 'Read book', TaskStatus.TODO, TaskPriority.LOW, 'u1');
  });

  it('✅ push() should execute the command and store it', () => {
    const command = new ChangeTaskStatusCommand(task, TaskStatus.IN_PROGRESS);

    history.push(command);

    expect(task.status).toBe(TaskStatus.IN_PROGRESS);
    expect(history.getHistoryLength()).toBe(1);
  });

  it('✅ undoLast() should revert the most recent command', () => {
    history.push(new ChangeTaskStatusCommand(task, TaskStatus.IN_PROGRESS));
    history.push(new ChangeTaskStatusCommand(task, TaskStatus.DONE));

    expect(task.status).toBe(TaskStatus.DONE);
    expect(history.getHistoryLength()).toBe(2);

    history.undoLast();
    expect(task.status).toBe(TaskStatus.IN_PROGRESS);
    expect(history.getHistoryLength()).toBe(1);
  });

  it('🔄 undoLast() on empty history should not crash', () => {
    expect(() => history.undoLast()).not.toThrow();
    expect(history.getHistoryLength()).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// OBSERVER PATTERN
// ═══════════════════════════════════════════════════════════════

describe('TaskStatusNotifier (Observer)', () => {
  let notifier: TaskStatusNotifier;
  let mockObserver: IObserver<TaskEntity>;

  beforeEach(() => {
    notifier = new TaskStatusNotifier();
    mockObserver = { update: jest.fn() };
  });

  it('✅ attach() should add observer and notify() should call update()', () => {
    notifier.attach(mockObserver);
    const task = new TaskEntity('t1', 'Test', TaskStatus.DONE, TaskPriority.HIGH, 'u1');

    notifier.notify(task);

    expect(mockObserver.update).toHaveBeenCalledTimes(1);
    expect(mockObserver.update).toHaveBeenCalledWith(task);
  });

  it('✅ should notify multiple observers', () => {
    const observer2: IObserver<TaskEntity> = { update: jest.fn() };
    notifier.attach(mockObserver);
    notifier.attach(observer2);

    const task = new TaskEntity('t1', 'Test', TaskStatus.DONE, TaskPriority.HIGH, 'u1');
    notifier.notify(task);

    expect(mockObserver.update).toHaveBeenCalledTimes(1);
    expect(observer2.update).toHaveBeenCalledTimes(1);
  });

  it('✅ detach() should remove observer so it is no longer notified', () => {
    notifier.attach(mockObserver);
    notifier.detach(mockObserver);

    const task = new TaskEntity('t1', 'Test', TaskStatus.DONE, TaskPriority.HIGH, 'u1');
    notifier.notify(task);

    expect(mockObserver.update).not.toHaveBeenCalled();
  });

  it('🔄 attach() same observer twice should not cause double notification', () => {
    notifier.attach(mockObserver);
    notifier.attach(mockObserver); // duplicate

    const task = new TaskEntity('t1', 'Test', TaskStatus.DONE, TaskPriority.HIGH, 'u1');
    notifier.notify(task);

    expect(mockObserver.update).toHaveBeenCalledTimes(1);
  });

  it('🔄 notify() with no observers should not throw', () => {
    const task = new TaskEntity('t1', 'Test', TaskStatus.DONE, TaskPriority.HIGH, 'u1');
    expect(() => notifier.notify(task)).not.toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════
// DECORATOR PATTERN
// ═══════════════════════════════════════════════════════════════

describe('RecurringTaskDecorator', () => {
  it('✅ completeTask() should return a NEW task with TODO status', () => {
    const deadline = new Date('2026-06-15');
    const baseTask = new TaskEntity('t1', 'Weekly review', TaskStatus.TODO, TaskPriority.HIGH, 'u1', 'Do review', deadline, 'subj-1');

    const recurring = new RecurringTaskDecorator(baseTask, 7);
    const newTask = recurring.completeTask();

    // Original task should be marked DONE
    expect(baseTask.status).toBe(TaskStatus.DONE);

    // New task should be auto-generated
    expect(newTask).not.toBeNull();
    expect(newTask!.status).toBe(TaskStatus.TODO);
    expect(newTask!.title).toBe('Weekly review');
    expect(newTask!.priority).toBe(TaskPriority.HIGH);
    expect(newTask!.userId).toBe('u1');
    expect(newTask!.id).toMatch(/^auto-gen-/);
  });

  it('✅ should calculate next deadline by adding recurrenceDays', () => {
    const deadline = new Date('2026-06-15');
    const baseTask = new TaskEntity('t1', 'Task', TaskStatus.TODO, TaskPriority.MEDIUM, 'u1', undefined, deadline);

    const recurring = new RecurringTaskDecorator(baseTask, 14);
    const newTask = recurring.completeTask();

    const expectedDeadline = new Date('2026-06-29'); // +14 days
    expect(newTask!.deadline!.toISOString().slice(0, 10)).toBe(expectedDeadline.toISOString().slice(0, 10));
  });

  it('✅ decorator should transparently delegate properties from wrappee', () => {
    const baseTask = new TaskEntity('t1', 'Delegated', TaskStatus.TODO, TaskPriority.LOW, 'u1', 'desc', undefined, 'subj-1');
    const recurring = new RecurringTaskDecorator(baseTask, 7);

    expect(recurring.id).toBe('t1');
    expect(recurring.title).toBe('Delegated');
    expect(recurring.status).toBe(TaskStatus.TODO);
    expect(recurring.priority).toBe(TaskPriority.LOW);
    expect(recurring.userId).toBe('u1');
    expect(recurring.description).toBe('desc');
    expect(recurring.subjectId).toBe('subj-1');
  });
});

// ═══════════════════════════════════════════════════════════════
// SINGLETON PATTERN
// ═══════════════════════════════════════════════════════════════

describe('DeadlineNotificationManager (Singleton)', () => {
  it('✅ getInstance() should always return the same instance', () => {
    const instance1 = DeadlineNotificationManager.getInstance();
    const instance2 = DeadlineNotificationManager.getInstance();

    expect(instance1).toBe(instance2); // Strict reference equality
  });

  it('✅ queueHotNotification() should not throw when no connection exists', () => {
    const manager = DeadlineNotificationManager.getInstance();

    expect(() => manager.queueHotNotification('u1', 'Test alert')).not.toThrow();
  });

  it('✅ registerConnection() should accept new connections', () => {
    const manager = DeadlineNotificationManager.getInstance();
    const fakeWs = { send: jest.fn() };

    expect(() => manager.registerConnection('u1', fakeWs)).not.toThrow();
  });
});

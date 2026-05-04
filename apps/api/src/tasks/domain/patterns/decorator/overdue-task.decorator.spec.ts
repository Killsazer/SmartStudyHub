import { OverdueTaskDecorator } from './overdue-task.decorator';
import { TaskEntity, TaskStatus, TaskPriority } from '../../task.entity';

const makeTask = (overrides: Partial<{
  status: TaskStatus;
  deadline: Date;
}> = {}): TaskEntity =>
  new TaskEntity({
    id: 't1',
    title: 'Test',
    status: overrides.status ?? TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    userId: 'u1',
    deadline: overrides.deadline,
  });

describe('OverdueTaskDecorator', () => {
  describe('isOverdue computation', () => {
    it('✅ returns true when deadline is in the past and status is not DONE', () => {
      const task = makeTask({ deadline: new Date('2020-01-01') });
      const decorator = new OverdueTaskDecorator(task);

      expect(decorator.isOverdue).toBe(true);
    });

    it('✅ returns false when deadline is in the future', () => {
      const future = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const task = makeTask({ deadline: future });
      const decorator = new OverdueTaskDecorator(task);

      expect(decorator.isOverdue).toBe(false);
    });

    it('✅ returns false when task is DONE — completed tasks are never overdue', () => {
      const task = makeTask({
        status: TaskStatus.DONE,
        deadline: new Date('2020-01-01'),
      });
      const decorator = new OverdueTaskDecorator(task);

      expect(decorator.isOverdue).toBe(false);
    });

    it('✅ returns false when task has no deadline', () => {
      const task = makeTask();
      const decorator = new OverdueTaskDecorator(task);

      expect(decorator.isOverdue).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('✅ should append isOverdue flag to wrappee JSON', () => {
      const task = makeTask({ deadline: new Date('2020-01-01') });
      const decorator = new OverdueTaskDecorator(task);

      const json = decorator.toJSON();

      expect(json).toHaveProperty('id', 't1');
      expect(json).toHaveProperty('title', 'Test');
      expect(json.isOverdue).toBe(true);
    });

    it('✅ isOverdue is false in JSON when deadline is missing', () => {
      const task = makeTask();
      const decorator = new OverdueTaskDecorator(task);

      const json = decorator.toJSON();

      expect(json.isOverdue).toBe(false);
    });
  });

  describe('property delegation (Decorator transparency)', () => {
    it('✅ should expose wrappee fields untouched', () => {
      const task = makeTask({ deadline: new Date('2020-01-01') });
      const decorator = new OverdueTaskDecorator(task);

      expect(decorator.id).toBe('t1');
      expect(decorator.title).toBe('Test');
      expect(decorator.status).toBe(TaskStatus.TODO);
      expect(decorator.priority).toBe(TaskPriority.MEDIUM);
      expect(decorator.userId).toBe('u1');
    });
  });
});

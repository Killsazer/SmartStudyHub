import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskEntity, TaskStatus, TaskPriority } from '../domain/task.entity';
import { OverdueTaskDecorator } from '../domain/patterns/decorator/overdue-task.decorator';

describe('TaskService', () => {
  let service: TaskService;
  let mockTaskRepo: any;
  let mockHistoryManager: any;

  const createTask = (overrides: Partial<any> = {}): TaskEntity =>
    new TaskEntity({
      id: 't1',
      title: 'Test task',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      userId: 'u1',
      ...overrides,
    });

  beforeEach(async () => {
    mockTaskRepo = {
      save: jest.fn().mockImplementation(async (t) => t),
      delete: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByUserId: jest.fn(),
    };

    mockHistoryManager = {
      execute: jest.fn().mockResolvedValue(undefined),
      undo: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        { provide: 'ITaskRepository', useValue: mockTaskRepo },
        { provide: 'CommandHistoryManager', useValue: mockHistoryManager },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  describe('createTask', () => {
    it('✅ should create task with all fields and save', async () => {
      const dto = {
        title: 'Study NestJS',
        description: 'Chapter 5',
        priority: TaskPriority.HIGH,
        deadline: '2026-12-01',
        subjectId: 'subj-1',
      };

      const result = await service.createTask('u1', dto);

      expect(result).toBeInstanceOf(TaskEntity);
      expect(result.title).toBe('Study NestJS');
      expect(result.status).toBe(TaskStatus.TODO);
      expect(result.priority).toBe(TaskPriority.HIGH);
      expect(result.userId).toBe('u1');
      expect(mockTaskRepo.save).toHaveBeenCalledTimes(1);
    });

    it('✅ should use default MEDIUM priority when not specified', async () => {
      const result = await service.createTask('u1', { title: 'Quick task' } as any);
      expect(result.priority).toBe(TaskPriority.MEDIUM);
    });

    it('✅ should pass recurrenceDays to entity', async () => {
      const dto = { title: 'Recurring', recurrenceDays: 7 };
      const result = await service.createTask('u1', dto as any);
      expect(result.recurrenceDays).toBe(7);
    });
  });

  describe('updateTaskStatus (Command Pattern)', () => {
    it('✅ should delegate to CommandHistoryManager', async () => {
      const task = createTask();
      mockTaskRepo.findById.mockResolvedValue(task);

      await service.updateTaskStatus('u1', 't1', TaskStatus.DONE);

      expect(mockHistoryManager.execute).toHaveBeenCalledTimes(1);
      expect(mockHistoryManager.execute.mock.calls[0][0]).toBe('u1');
    });

    it('✅ should skip when status is the same', async () => {
      const task = createTask({ status: TaskStatus.DONE });
      mockTaskRepo.findById.mockResolvedValue(task);

      await service.updateTaskStatus('u1', 't1', TaskStatus.DONE);

      expect(mockHistoryManager.execute).not.toHaveBeenCalled();
    });

    it('❌ should throw NotFoundException for missing task', async () => {
      mockTaskRepo.findById.mockResolvedValue(null);

      await expect(service.updateTaskStatus('u1', 'missing', TaskStatus.DONE))
        .rejects.toThrow(NotFoundException);
    });

    it('❌ should throw ForbiddenException for other user\'s task', async () => {
      mockTaskRepo.findById.mockResolvedValue(createTask({ userId: 'other' }));

      await expect(service.updateTaskStatus('u1', 't1', TaskStatus.DONE))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('undoLastStatusChange', () => {
    it('✅ should delegate to CommandHistoryManager.undo', async () => {
      await service.undoLastStatusChange('u1');
      expect(mockHistoryManager.undo).toHaveBeenCalledWith('u1');
    });
  });

  describe('getUserTasks (Strategy Pattern)', () => {
    const createTasks = () => [
      createTask({ id: '1', title: 'Beta', priority: TaskPriority.LOW, deadline: new Date('2026-12-01') }),
      createTask({ id: '2', title: 'Alpha', priority: TaskPriority.HIGH, deadline: new Date('2026-06-01') }),
      createTask({ id: '3', title: 'Gamma', priority: TaskPriority.MEDIUM, deadline: new Date('2026-09-01') }),
    ];

    it('✅ should return unsorted tasks when no sortType', async () => {
      const tasks = createTasks();
      mockTaskRepo.findByUserId.mockResolvedValue(tasks);

      const result = await service.getUserTasks('u1');
      expect(result).toEqual(tasks.map(task => new OverdueTaskDecorator(task)));
    });

    it('✅ Strategy: deadline — nearest first', async () => {
      mockTaskRepo.findByUserId.mockResolvedValue(createTasks());
      const sorted = await service.getUserTasks('u1', 'deadline');

      expect(sorted[0].id).toBe('2');
      expect(sorted[2].id).toBe('1');
    });

    it('✅ Strategy: priority — highest first', async () => {
      mockTaskRepo.findByUserId.mockResolvedValue(createTasks());
      const sorted = await service.getUserTasks('u1', 'priority');

      expect(sorted[0].priority).toBe(TaskPriority.HIGH);
      expect(sorted[2].priority).toBe(TaskPriority.LOW);
    });

    it('✅ Strategy: title — alphabetical', async () => {
      mockTaskRepo.findByUserId.mockResolvedValue(createTasks());
      const sorted = await service.getUserTasks('u1', 'title');

      expect(sorted[0].title).toBe('Alpha');
      expect(sorted[2].title).toBe('Gamma');
    });

    it('✅ should filter by subjectId', async () => {
      const tasks = [
        createTask({ id: '1', subjectId: 's1' }),
        createTask({ id: '2', subjectId: 's2' }),
      ];
      mockTaskRepo.findByUserId.mockResolvedValue(tasks);

      const result = await service.getUserTasks('u1', undefined, 's1');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('✅ should return original order for unknown sortType', async () => {
      const tasks = createTasks();
      mockTaskRepo.findByUserId.mockResolvedValue(tasks);

      const result = await service.getUserTasks('u1', 'unknown');
      expect(result).toEqual(tasks.map(task => new OverdueTaskDecorator(task)));
    });

    it('✅ should return empty array when user has no tasks', async () => {
      mockTaskRepo.findByUserId.mockResolvedValue([]);
      const result = await service.getUserTasks('u1', 'deadline');
      expect(result).toEqual([]);
    });
  });

  describe('updateTask', () => {
    it('✅ should update fields and save', async () => {
      const task = createTask();
      mockTaskRepo.findById.mockResolvedValue(task);

      const result = await service.updateTask('u1', 't1', { title: 'Updated' });

      expect(result.title).toBe('Updated');
      expect(mockTaskRepo.save).toHaveBeenCalled();
    });

    it('❌ should throw ForbiddenException for other user', async () => {
      mockTaskRepo.findById.mockResolvedValue(createTask({ userId: 'other' }));

      await expect(service.updateTask('u1', 't1', { title: 'X' }))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteTask', () => {
    it('✅ should delete task when user is owner', async () => {
      mockTaskRepo.findById.mockResolvedValue(createTask());

      await service.deleteTask('u1', 't1');
      expect(mockTaskRepo.delete).toHaveBeenCalledWith('t1');
    });

    it('❌ should throw NotFoundException for missing task', async () => {
      mockTaskRepo.findById.mockResolvedValue(null);

      await expect(service.deleteTask('u1', 'missing'))
        .rejects.toThrow(NotFoundException);
    });
  });
});

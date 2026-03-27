// File: src/tasks/application/task.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { TaskEntity, TaskStatus, TaskPriority } from '../domain/task.entity';
import { NotFoundException } from '@nestjs/common';

describe('TaskService', () => {
  let service: TaskService;
  let mockTaskRepo: any;

  beforeEach(async () => {
    mockTaskRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        { provide: 'ITaskRepository', useValue: mockTaskRepo },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    jest.clearAllMocks();
  });

  // ──────────────── CREATE TASK ────────────────

  describe('createTask', () => {
    it('✅ should create task with all fields and save to repository', async () => {
      const dto = { title: 'Study NestJS', description: 'Chapter 5', priority: TaskPriority.HIGH, deadline: '2026-12-01', subjectId: 'subj-1' };
      
      const result = await service.createTask('u1', dto);

      expect(mockTaskRepo.save).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(TaskEntity);
      expect(result.title).toBe('Study NestJS');
      expect(result.status).toBe(TaskStatus.TODO); // Always starts as TODO
      expect(result.priority).toBe(TaskPriority.HIGH);
      expect(result.userId).toBe('u1');
      expect(result.description).toBe('Chapter 5');
      expect(result.subjectId).toBe('subj-1');
      expect(result.deadline).toBeInstanceOf(Date);
    });

    it('✅ should use default MEDIUM priority when not specified', async () => {
      const dto = { title: 'Quick task' };
      
      const result = await service.createTask('u1', dto as any);

      expect(result.priority).toBe(TaskPriority.MEDIUM);
    });

    it('✅ should generate task ID with correct prefix', async () => {
      const dto = { title: 'Task' };
      
      const result = await service.createTask('u1', dto as any);

      expect(result.id).toMatch(/^task-\d+$/);
    });

    it('✅ should handle undefined optional fields gracefully', async () => {
      const dto = { title: 'Minimal task' };
      
      const result = await service.createTask('u1', dto as any);

      expect(result.description).toBeUndefined();
      expect(result.deadline).toBeUndefined();
      expect(result.subjectId).toBeUndefined();
    });
  });

  // ──────────────── CHANGE STATUS (Command + Observer) ────────────────

  describe('changeTaskStatus', () => {
    it('✅ should execute Command and change status from TODO to DONE', async () => {
      const task = new TaskEntity('t1', 'Test', TaskStatus.TODO, TaskPriority.MEDIUM, 'u1');
      mockTaskRepo.findById.mockResolvedValue(task);
      
      await service.changeTaskStatus('t1', TaskStatus.DONE);
      
      expect(task.status).toBe(TaskStatus.DONE);
      expect(mockTaskRepo.save).toHaveBeenCalledWith(task);
    });

    it('✅ should change status from TODO to IN_PROGRESS', async () => {
      const task = new TaskEntity('t1', 'Test', TaskStatus.TODO, TaskPriority.MEDIUM, 'u1');
      mockTaskRepo.findById.mockResolvedValue(task);
      
      await service.changeTaskStatus('t1', TaskStatus.IN_PROGRESS);
      
      expect(task.status).toBe(TaskStatus.IN_PROGRESS);
    });

    it('✅ should trigger Observer notification when status changes', async () => {
      // The Observer (DeadlineAlertObserver) queues a notification via Singleton.
      // We verify the flow completes without errors (Observer is internal).
      const task = new TaskEntity('t1', 'Important', TaskStatus.TODO, TaskPriority.HIGH, 'u1');
      mockTaskRepo.findById.mockResolvedValue(task);
      
      await expect(service.changeTaskStatus('t1', TaskStatus.DONE)).resolves.not.toThrow();
      expect(mockTaskRepo.save).toHaveBeenCalled();
    });

    it('❌ should throw NotFoundException when task does not exist', async () => {
      mockTaskRepo.findById.mockResolvedValue(null);
      
      await expect(service.changeTaskStatus('nonexistent-id', TaskStatus.DONE))
        .rejects.toThrow(NotFoundException);
      
      expect(mockTaskRepo.save).not.toHaveBeenCalled(); // Must NOT save anything
    });

    it('🔄 should propagate repository errors on save', async () => {
      const task = new TaskEntity('t1', 'Test', TaskStatus.TODO, TaskPriority.MEDIUM, 'u1');
      mockTaskRepo.findById.mockResolvedValue(task);
      mockTaskRepo.save.mockRejectedValue(new Error('DB write failed'));
      
      await expect(service.changeTaskStatus('t1', TaskStatus.DONE))
        .rejects.toThrow('DB write failed');
    });
  });

  // ──────────────── GET USER TASKS (Strategy Pattern) ────────────────

  describe('getUserTasks', () => {
    const createTasks = () => [
      new TaskEntity('1', 'Beta task', TaskStatus.TODO, TaskPriority.LOW, 'u1', undefined, new Date('2026-12-01')),
      new TaskEntity('2', 'Alpha task', TaskStatus.TODO, TaskPriority.HIGH, 'u1', undefined, new Date('2026-06-01')),
      new TaskEntity('3', 'Gamma task', TaskStatus.TODO, TaskPriority.MEDIUM, 'u1', undefined, new Date('2026-09-01')),
    ];

    it('✅ should return unsorted tasks when no sortType provided', async () => {
      const tasks = createTasks();
      mockTaskRepo.findByUserId.mockResolvedValue(tasks);
      
      const result = await service.getUserTasks('u1');
      
      expect(result).toEqual(tasks); // Preserve original order
    });

    it('✅ Strategy: deadline — should sort by nearest deadline first', async () => {
      mockTaskRepo.findByUserId.mockResolvedValue(createTasks());
      
      const sorted = await service.getUserTasks('u1', 'deadline');
      
      expect(sorted[0].id).toBe('2'); // June 2026
      expect(sorted[1].id).toBe('3'); // Sept 2026
      expect(sorted[2].id).toBe('1'); // Dec 2026
    });

    it('✅ Strategy: priority — should sort by highest priority first', async () => {
      mockTaskRepo.findByUserId.mockResolvedValue(createTasks());
      
      const sorted = await service.getUserTasks('u1', 'priority');
      
      expect(sorted[0].priority).toBe(TaskPriority.HIGH);
      expect(sorted[1].priority).toBe(TaskPriority.MEDIUM);
      expect(sorted[2].priority).toBe(TaskPriority.LOW);
    });

    it('✅ Strategy: title — should sort alphabetically', async () => {
      mockTaskRepo.findByUserId.mockResolvedValue(createTasks());
      
      const sorted = await service.getUserTasks('u1', 'title');
      
      expect(sorted[0].title).toBe('Alpha task');
      expect(sorted[1].title).toBe('Beta task');
      expect(sorted[2].title).toBe('Gamma task');
    });

    it('🔄 should ignore case for sortType parameter', async () => {
      mockTaskRepo.findByUserId.mockResolvedValue(createTasks());
      
      const sorted = await service.getUserTasks('u1', 'DEADLINE');
      
      expect(sorted[0].id).toBe('2');
    });

    it('🔄 should return original order for unknown sortType', async () => {
      const tasks = createTasks();
      mockTaskRepo.findByUserId.mockResolvedValue(tasks);
      
      const result = await service.getUserTasks('u1', 'created_at');
      
      expect(result).toEqual(tasks);
    });

    it('🔄 should return empty array when user has no tasks', async () => {
      mockTaskRepo.findByUserId.mockResolvedValue([]);
      
      const result = await service.getUserTasks('u1', 'deadline');
      
      expect(result).toEqual([]);
    });

    it('🔄 should handle tasks without deadlines in deadline sort', async () => {
      const tasks = [
        new TaskEntity('1', 'No deadline', TaskStatus.TODO, TaskPriority.LOW, 'u1'),
        new TaskEntity('2', 'Has deadline', TaskStatus.TODO, TaskPriority.LOW, 'u1', undefined, new Date('2026-01-01')),
      ];
      mockTaskRepo.findByUserId.mockResolvedValue(tasks);
      
      const sorted = await service.getUserTasks('u1', 'deadline');
      
      // Tasks with deadlines should come first
      expect(sorted[0].id).toBe('2');
      expect(sorted[1].id).toBe('1');
    });
  });
});

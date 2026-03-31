// File: src/schedule/application/schedule.service.spec.ts
// Covers: TeacherService, ScheduleSlotService (Factory Method), ExportScheduleUseCase, ImportScheduleUseCase
import { Test, TestingModule } from '@nestjs/testing';
import { TeacherService } from './teacher.service';
import { ScheduleSlotService } from './schedule-slot.service';
import { ExportScheduleUseCase } from './export-schedule.use-case';
import { ImportScheduleUseCase } from './import-schedule.use-case';
import { TeacherEntity } from '../domain/entities/teacher.entity';
import { ScheduleSlotEntity, ClassType } from '../domain/entities/schedule-slot.entity';
import { NotFoundException } from '@nestjs/common';

// ═══════════════════════════════════════════════════════════════
// TEACHER SERVICE
// ═══════════════════════════════════════════════════════════════

describe('TeacherService', () => {
  let service: TeacherService;
  let mockTeacherRepo: any;

  beforeEach(async () => {
    mockTeacherRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeacherService,
        { provide: 'ITeacherRepository', useValue: mockTeacherRepo },
      ],
    }).compile();

    service = module.get<TeacherService>(TeacherService);
    jest.clearAllMocks();
  });

  it('✅ should create a teacher and save to repository', async () => {
    const dto = { name: 'Dr. Smith', photoUrl: 'https://example.com/photo.jpg', contacts: 'smith@kpi.ua' };
    const result = await service.createTeacher('u1', dto);

    expect(mockTeacherRepo.save).toHaveBeenCalledTimes(1);
    expect(result).toBeInstanceOf(TeacherEntity);
    expect(result.name).toBe('Dr. Smith');
    expect(result.userId).toBe('u1');
    expect(result.id).toMatch(/^teacher-/);
  });

  it('✅ should return teachers for a user', async () => {
    const teachers = [new TeacherEntity('t1', 'Prof A', 'u1')];
    mockTeacherRepo.findByUserId.mockResolvedValue(teachers);

    const result = await service.getTeachers('u1');
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Prof A');
  });

  it('✅ should generate avatar URL from ui-avatars.com when no photoUrl', () => {
    const teacher = new TeacherEntity('t1', 'Dr. Smith', 'u1');
    const url = teacher.getAvatarUrl();
    expect(url).toContain('ui-avatars.com');
    expect(url).toContain('Dr.%20Smith');
  });

  it('✅ should return photoUrl when available', () => {
    const teacher = new TeacherEntity('t1', 'Dr. Smith', 'u1', 'https://example.com/photo.jpg');
    expect(teacher.getAvatarUrl()).toBe('https://example.com/photo.jpg');
  });

  it('❌ should throw NotFoundException when updating non-existent teacher', async () => {
    mockTeacherRepo.findById.mockResolvedValue(null);
    await expect(service.updateTeacher('u1', 'nonexistent', { name: 'New' }))
      .rejects.toThrow(NotFoundException);
  });
});

// ═══════════════════════════════════════════════════════════════
// SCHEDULE SLOT SERVICE (uses Factory Method pattern)
// ═══════════════════════════════════════════════════════════════

describe('ScheduleSlotService', () => {
  let service: ScheduleSlotService;
  let mockSlotRepo: any;

  beforeEach(async () => {
    mockSlotRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByUserIdAndWeek: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleSlotService,
        { provide: 'IScheduleSlotRepository', useValue: mockSlotRepo },
      ],
    }).compile();

    service = module.get<ScheduleSlotService>(ScheduleSlotService);
    jest.clearAllMocks();
  });

  it('✅ should create a schedule slot using Factory Method and save it', async () => {
    const dto = {
      subjectId: 'subj-1',
      teacherId: 'teacher-1',
      weekNumber: 1,
      dayOfWeek: 1,
      startTime: '08:30',
      endTime: '10:05',
      classType: ClassType.LECTURE,
      location: 'Aud. 305',
    };

    const result = await service.createSlot('u1', dto as any);

    expect(mockSlotRepo.save).toHaveBeenCalledTimes(1);
    expect(result).toBeInstanceOf(ScheduleSlotEntity);
    expect(result.classType).toBe(ClassType.LECTURE);
    expect(result.startTime).toBe('08:30');
    expect(result.id).toMatch(/^slot-/);
  });

  it('✅ should return slots filtered by week number', async () => {
    const slots = [
      new ScheduleSlotEntity('s1', 'u1', 'subj1', null, 1, 1, '08:30', '10:05', ClassType.LECTURE),
    ];
    mockSlotRepo.findByUserIdAndWeek.mockResolvedValue(slots);

    const result = await service.getSlots('u1', 1);
    expect(result.length).toBe(1);
    expect(mockSlotRepo.findByUserIdAndWeek).toHaveBeenCalledWith('u1', 1);
  });

  it('✅ should return all slots when no week filter', async () => {
    mockSlotRepo.findByUserId.mockResolvedValue([]);
    await service.getSlots('u1');
    expect(mockSlotRepo.findByUserId).toHaveBeenCalledWith('u1');
  });

  it('❌ should throw NotFoundException when updating non-existent slot', async () => {
    mockSlotRepo.findById.mockResolvedValue(null);
    await expect(service.updateSlot('u1', 'nonexistent', {}))
      .rejects.toThrow(NotFoundException);
  });
});

// ═══════════════════════════════════════════════════════════════
// EXPORT / IMPORT USE CASES
// ═══════════════════════════════════════════════════════════════

describe('ExportScheduleUseCase', () => {
  let useCase: ExportScheduleUseCase;
  let mockSlotRepo: any, mockTeacherRepo: any, mockSubjectRepo: any, mockSharedRepo: any;

  beforeEach(async () => {
    mockSlotRepo = { findByUserId: jest.fn().mockResolvedValue([]) };
    mockTeacherRepo = { findByUserId: jest.fn().mockResolvedValue([]) };
    mockSubjectRepo = { findByUserId: jest.fn().mockResolvedValue([]) };
    mockSharedRepo = { save: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportScheduleUseCase,
        { provide: 'IScheduleSlotRepository', useValue: mockSlotRepo },
        { provide: 'ITeacherRepository', useValue: mockTeacherRepo },
        { provide: 'ISubjectRepository', useValue: mockSubjectRepo },
        { provide: 'ISharedScheduleRepository', useValue: mockSharedRepo },
      ],
    }).compile();

    useCase = module.get<ExportScheduleUseCase>(ExportScheduleUseCase);
  });

  it('✅ should generate an 8-character hash token', async () => {
    const hash = await useCase.execute('u1');
    expect(hash).toHaveLength(8);
    expect(/^[0-9a-f]{8}$/.test(hash)).toBe(true);
  });

  it('✅ should save snapshot data to SharedSchedule repository', async () => {
    await useCase.execute('u1');
    expect(mockSharedRepo.save).toHaveBeenCalledTimes(1);
    const savedData = mockSharedRepo.save.mock.calls[0][0];
    expect(savedData.hashToken).toBeDefined();
    expect(savedData.snapshotData).toBeDefined();
    expect(savedData.userId).toBe('u1');
  });
});

describe('ImportScheduleUseCase', () => {
  let useCase: ImportScheduleUseCase;
  let mockSlotRepo: any, mockTeacherRepo: any, mockSubjectRepo: any, mockSharedRepo: any;

  const snapshotData = {
    subjects: [{ id: 'old-subj-1', title: 'Math', color: '#FF0000' }],
    teachers: [{ id: 'old-teacher-1', name: 'Prof. X', photoUrl: null, contacts: 'x@kpi.ua' }],
    slots: [{
      subjectId: 'old-subj-1', teacherId: 'old-teacher-1',
      weekNumber: 1, dayOfWeek: 1, startTime: '08:30', endTime: '10:05',
      classType: 'LECTURE', location: 'Aud 101',
    }],
  };

  beforeEach(async () => {
    mockSlotRepo = { save: jest.fn() };
    mockTeacherRepo = { save: jest.fn() };
    mockSubjectRepo = { save: jest.fn() };
    mockSharedRepo = {
      findByHashToken: jest.fn().mockResolvedValue({
        id: 'shared-1', hashToken: 'abc12345', snapshotData, userId: 'other-user',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImportScheduleUseCase,
        { provide: 'IScheduleSlotRepository', useValue: mockSlotRepo },
        { provide: 'ITeacherRepository', useValue: mockTeacherRepo },
        { provide: 'ISubjectRepository', useValue: mockSubjectRepo },
        { provide: 'ISharedScheduleRepository', useValue: mockSharedRepo },
      ],
    }).compile();

    useCase = module.get<ImportScheduleUseCase>(ImportScheduleUseCase);
  });

  it('✅ should clone subjects, teachers, and slots with NEW IDs', async () => {
    await useCase.execute('u2', 'abc12345');

    expect(mockSubjectRepo.save).toHaveBeenCalledTimes(1);
    expect(mockTeacherRepo.save).toHaveBeenCalledTimes(1);
    expect(mockSlotRepo.save).toHaveBeenCalledTimes(1);

    // Verify new IDs (not old ones)
    const savedSubject = mockSubjectRepo.save.mock.calls[0][0];
    expect(savedSubject.id).not.toBe('old-subj-1');
    expect(savedSubject.title).toBe('Math');
    expect(savedSubject.userId).toBe('u2');

    const savedTeacher = mockTeacherRepo.save.mock.calls[0][0];
    expect(savedTeacher.id).not.toBe('old-teacher-1');
    expect(savedTeacher.name).toBe('Prof. X');
    expect(savedTeacher.userId).toBe('u2');
  });

  it('❌ should throw NotFoundException for invalid hash token', async () => {
    mockSharedRepo.findByHashToken.mockResolvedValue(null);
    await expect(useCase.execute('u2', 'INVALID'))
      .rejects.toThrow(NotFoundException);
  });
});

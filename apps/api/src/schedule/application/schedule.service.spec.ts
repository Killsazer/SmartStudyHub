import { Test, TestingModule } from '@nestjs/testing';
import { TeacherService } from './services/teacher.service';
import { ScheduleSlotService } from './services/schedule-slot.service';
import { ExportScheduleUseCase } from './use-cases/export-schedule.use-case';
import { ImportScheduleUseCase } from './use-cases/import-schedule.use-case';
import { TeacherEntity, TeacherProps } from '../domain/entities/teacher.entity';
import { ClassType, ScheduleSlotProps } from '../domain/entities/schedule-slot.entity';
import { ScheduleSlotFactory } from '../domain/patterns/schedule-slot.factory';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

// ═══════════════════════════════════════════════════════════════
// TEACHER SERVICE TESTS
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

  it('✅ should create a teacher using Props and save to repository', async () => {
    const dto = { name: 'Dr. Smith', photoUrl: 'https://example.com/photo.jpg', contacts: 'smith@kpi.ua' };
    const result = await service.createTeacher('u1', dto);

    expect(mockTeacherRepo.save).toHaveBeenCalledTimes(1);
    expect(result).toBeInstanceOf(TeacherEntity);
    expect(result.name).toBe('Dr. Smith');
    expect(result.userId).toBe('u1');
    expect(result.id).toBeDefined();
  });

  it('✅ should return teachers for a user', async () => {
    const props: TeacherProps = { id: 't1', name: 'Prof A', userId: 'u1' };
    const teachers = [new TeacherEntity(props)];
    mockTeacherRepo.findByUserId.mockResolvedValue(teachers);

    const result = await service.getTeachers('u1');
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Prof A');
  });

  it('✅ should generate avatar URL from ui-avatars.com when no photoUrl is provided', () => {
    const props: TeacherProps = { id: 't1', name: 'Dr. Smith', userId: 'u1' };
    const teacher = new TeacherEntity(props);
    const url = teacher.getAvatarUrl();
    
    expect(url).toContain('ui-avatars.com');
    expect(url).toContain('Dr.%20Smith');
  });

  it('❌ should throw NotFoundException when updating non-existent teacher', async () => {
    mockTeacherRepo.findById.mockResolvedValue(null);
    await expect(service.updateTeacher('u1', 'nonexistent', { name: 'New' }))
      .rejects.toThrow(NotFoundException);
  });

  it('🚨 SECURITY: should throw ForbiddenException when updating a teacher belonging to another user', async () => {
    const props: TeacherProps = { id: 't1', name: 'Hacked Teacher', userId: 'victim-user' };
    mockTeacherRepo.findById.mockResolvedValue(new TeacherEntity(props));

    // 'hacker-user' намагається оновити викладача 'victim-user'
    await expect(service.updateTeacher('hacker-user', 't1', { name: 'Hacked' }))
      .rejects.toThrow(ForbiddenException);
  });
});

// ═══════════════════════════════════════════════════════════════
// SCHEDULE SLOT SERVICE TESTS
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
      subjectId: 'subj-1', teacherId: 'teacher-1',
      weekNumber: 1, dayOfWeek: 1, startTime: '08:30', endTime: '10:05',
      classType: ClassType.LECTURE, location: 'Aud. 305',
    };

    const result = await service.createSlot('u1', dto as any);

    expect(mockSlotRepo.save).toHaveBeenCalledTimes(1);
    expect(result.classType).toBe(ClassType.LECTURE);
    expect(result.startTime).toBe('08:30');
    expect(result.id).toBeDefined();
    
    // Перевірка інкапсуляції
    expect(result.getSlotDetails()).toContain('Aud. 305');
  });

  it('✅ should return slots filtered by week number', async () => {
    const props: ScheduleSlotProps = {
      id: 's1', userId: 'u1', subjectId: 'subj1', teacherId: null,
      weekNumber: 1, dayOfWeek: 1, startTime: '08:30', endTime: '10:05'
    };
    const slots = [ScheduleSlotFactory.createSlot(ClassType.LECTURE, props)];
    mockSlotRepo.findByUserIdAndWeek.mockResolvedValue(slots);

    const result = await service.getSlots('u1', 1);
    expect(result.length).toBe(1);
    expect(mockSlotRepo.findByUserIdAndWeek).toHaveBeenCalledWith('u1', 1);
  });

  it('🚨 SECURITY: should throw ForbiddenException when deleting another user\'s slot (IDOR)', async () => {
    const props: ScheduleSlotProps = {
      id: 's1', userId: 'victim-user', subjectId: 'subj1', teacherId: null,
      weekNumber: 1, dayOfWeek: 1, startTime: '08:30', endTime: '10:05'
    };
    const victimSlot = ScheduleSlotFactory.createSlot(ClassType.LECTURE, props);
    mockSlotRepo.findById.mockResolvedValue(victimSlot);

    await expect(service.deleteSlot('hacker-user', 's1'))
      .rejects.toThrow(ForbiddenException);
      
    // Переконуємось, що репозиторій НЕ був викликаний для видалення
    expect(mockSlotRepo.delete).not.toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════
// EXPORT / IMPORT USE CASES TESTS
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

  it('✅ should generate an 8-character hash token and save snapshot', async () => {
    const hash = await useCase.execute('u1');
    
    expect(hash).toHaveLength(8);
    expect(/^[0-9a-f]{8}$/.test(hash)).toBe(true);
    
    expect(mockSharedRepo.save).toHaveBeenCalledTimes(1);
    const savedData = mockSharedRepo.save.mock.calls[0][0];
    expect(savedData.hashToken).toBe(hash);
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

  it('✅ should successfully import subjects, teachers, and slots with mapped NEW IDs', async () => {
    await useCase.execute('u2', 'abc12345');

    // Перевіряємо виклики репозиторіїв
    expect(mockSubjectRepo.save).toHaveBeenCalledTimes(1);
    expect(mockTeacherRepo.save).toHaveBeenCalledTimes(1);
    expect(mockSlotRepo.save).toHaveBeenCalledTimes(1);

    // Перевіряємо, що ID викладача був згенерований заново, а userId відповідає новому власнику
    const savedTeacher = mockTeacherRepo.save.mock.calls[0][0];
    expect(savedTeacher.id).not.toBe('old-teacher-1');
    expect(savedTeacher.userId).toBe('u2');
    
    // Перевіряємо слот розкладу (має бути згенерований через Фабрику)
    const savedSlot = mockSlotRepo.save.mock.calls[0][0];
    expect(savedSlot.userId).toBe('u2');
    expect(savedSlot.subjectId).not.toBe('old-subj-1'); // Foreign Key має бути оновлений
  });
})
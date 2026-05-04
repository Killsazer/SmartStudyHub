import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ScheduleSlotService } from './schedule-slot.service';
import { ClassType, ScheduleSlotProps } from '../domain/schedule-slot.entity';
import { ScheduleSlotFactory } from '../domain/patterns/schedule-slot.factory';
import { TeacherService } from '../../teachers/application/teacher.service';

const createSlotEntity = (overrides: Partial<ScheduleSlotProps> = {}) => {
  const props: ScheduleSlotProps = {
    id: 'slot-1',
    userId: 'u1',
    subjectId: 'subj-1',
    teacherId: null,
    weekNumber: 1,
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '09:30',
    ...overrides,
  };
  return ScheduleSlotFactory.createSlot(ClassType.LECTURE, props);
};

describe('ScheduleSlotService', () => {
  let service: ScheduleSlotService;
  let mockSlotRepo: any;
  let mockTeacherService: { findTeacherById: jest.Mock };

  beforeEach(async () => {
    mockSlotRepo = {
      save: jest.fn().mockImplementation(async (s) => s),
      update: jest.fn().mockImplementation(async (id, data) => createSlotEntity()),
      delete: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByUserIdAndWeek: jest.fn(),
    };

    mockTeacherService = {
      findTeacherById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleSlotService,
        { provide: 'IScheduleSlotRepository', useValue: mockSlotRepo },
        { provide: TeacherService, useValue: mockTeacherService },
      ],
    }).compile();

    service = module.get<ScheduleSlotService>(ScheduleSlotService);
  });

  describe('createSlot', () => {
    const baseDto = {
      subjectId: 'subj-1',
      weekNumber: 1,
      dayOfWeek: 1,
      startTime: '08:00',
      endTime: '09:30',
      classType: ClassType.LECTURE,
    };

    it('✅ should create slot via Factory and save', async () => {
      const result = await service.createSlot('u1', baseDto as any);

      expect(result.classType).toBe(ClassType.LECTURE);
      expect(result.userId).toBe('u1');
      expect(result.subjectId).toBe('subj-1');
      expect(mockSlotRepo.save).toHaveBeenCalledTimes(1);
    });

    it('✅ should create slot with teacherId when teacher exists', async () => {
      mockTeacherService.findTeacherById.mockResolvedValue({ id: 'teacher-1', name: 'Prof' });
      const dto = { ...baseDto, teacherId: 'teacher-1' };

      const result = await service.createSlot('u1', dto as any);

      expect(result.teacherId).toBe('teacher-1');
      expect(mockTeacherService.findTeacherById).toHaveBeenCalledWith('teacher-1');
    });

    it('❌ should throw NotFoundException if teacherId does not exist', async () => {
      mockTeacherService.findTeacherById.mockResolvedValue(null);
      const dto = { ...baseDto, teacherId: 'nonexistent' };

      await expect(service.createSlot('u1', dto as any))
        .rejects.toThrow(NotFoundException);

      expect(mockSlotRepo.save).not.toHaveBeenCalled();
    });

    it('✅ should skip teacher validation when teacherId is not provided', async () => {
      await service.createSlot('u1', baseDto as any);

      expect(mockTeacherService.findTeacherById).not.toHaveBeenCalled();
    });

    it('✅ should create correct subclass via Factory (LAB) when teacher is assigned', async () => {
      mockTeacherService.findTeacherById.mockResolvedValue({ id: 'teacher-1', name: 'Prof' });
      const dto = { ...baseDto, classType: ClassType.LAB, teacherId: 'teacher-1' };

      const result = await service.createSlot('u1', dto as any);

      expect(result.classType).toBe(ClassType.LAB);
      expect(result.teacherId).toBe('teacher-1');
    });

    it('❌ should reject LAB slot without a teacher (polymorphic LabSlot.validate)', async () => {
      const dto = { ...baseDto, classType: ClassType.LAB };

      await expect(service.createSlot('u1', dto as any)).rejects.toThrow(BadRequestException);
      expect(mockSlotRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('updateSlot — cross-module validation', () => {
    it('✅ should update slot when user is the owner', async () => {
      mockSlotRepo.findById.mockResolvedValue(createSlotEntity());

      await service.updateSlot('u1', 'slot-1', { weekNumber: 2 } as any);

      expect(mockSlotRepo.update).toHaveBeenCalledWith('slot-1', { weekNumber: 2 });
    });

    it('❌ should throw NotFoundException when slot does not exist', async () => {
      mockSlotRepo.findById.mockResolvedValue(null);

      await expect(service.updateSlot('u1', 'nonexistent', {} as any))
        .rejects.toThrow(NotFoundException);
    });

    it('❌ should throw ForbiddenException when user is not the owner', async () => {
      mockSlotRepo.findById.mockResolvedValue(createSlotEntity({ userId: 'other' }));

      await expect(service.updateSlot('u1', 'slot-1', {} as any))
        .rejects.toThrow(ForbiddenException);
    });

    it('❌ should throw NotFoundException if new teacherId does not exist', async () => {
      mockSlotRepo.findById.mockResolvedValue(createSlotEntity());
      mockTeacherService.findTeacherById.mockResolvedValue(null);

      await expect(service.updateSlot('u1', 'slot-1', { teacherId: 'bad-id' } as any))
        .rejects.toThrow(NotFoundException);

      expect(mockSlotRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteSlot', () => {
    it('✅ should delete slot when user is owner', async () => {
      mockSlotRepo.findById.mockResolvedValue(createSlotEntity());

      await service.deleteSlot('u1', 'slot-1');

      expect(mockSlotRepo.delete).toHaveBeenCalledWith('slot-1');
    });

    it('❌ should throw NotFoundException when slot does not exist', async () => {
      mockSlotRepo.findById.mockResolvedValue(null);

      await expect(service.deleteSlot('u1', 'missing'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getSlots', () => {
    it('✅ should return all slots when no weekNumber', async () => {
      const slots = [createSlotEntity(), createSlotEntity({ id: 'slot-2' })];
      mockSlotRepo.findByUserId.mockResolvedValue(slots);

      const result = await service.getSlots('u1');

      expect(result).toHaveLength(2);
      expect(mockSlotRepo.findByUserId).toHaveBeenCalledWith('u1');
    });

    it('✅ should filter by weekNumber when provided', async () => {
      mockSlotRepo.findByUserIdAndWeek.mockResolvedValue([createSlotEntity()]);

      const result = await service.getSlots('u1', 1);

      expect(result).toHaveLength(1);
      expect(mockSlotRepo.findByUserIdAndWeek).toHaveBeenCalledWith('u1', 1);
    });

    it('✅ should return empty array when user has no slots', async () => {
      mockSlotRepo.findByUserId.mockResolvedValue([]);

      const result = await service.getSlots('u1');

      expect(result).toEqual([]);
    });
  });
});

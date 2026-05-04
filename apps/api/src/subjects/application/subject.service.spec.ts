import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { SubjectService } from './subject.service';
import { SubjectEntity } from '../domain/subject.entity';

const makeSubject = (overrides: Partial<{ id: string; title: string; userId: string; color: string }> = {}) =>
  new SubjectEntity({
    id: overrides.id ?? 'subj-1',
    title: overrides.title ?? 'Title',
    userId: overrides.userId ?? 'u1',
    color: overrides.color ?? '#000000',
  });

describe('SubjectService', () => {
  let service: SubjectService;
  let mockSubjectRepo: {
    save: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    findById: jest.Mock;
    findByUserId: jest.Mock;
    deleteAll: jest.Mock;
  };

  beforeEach(async () => {
    mockSubjectRepo = {
      save: jest.fn().mockImplementation(async (s) => s),
      update: jest.fn().mockImplementation(async (id) => makeSubject({ id })),
      delete: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      deleteAll: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubjectService,
        { provide: 'ISubjectRepository', useValue: mockSubjectRepo },
      ],
    }).compile();

    service = module.get<SubjectService>(SubjectService);
  });

  describe('createSubject', () => {
    it('✅ should create subject and save to repository', async () => {
      const dto = { title: 'Mathematics', color: '#FF5722' };

      const subject = await service.createSubject('u1', dto);

      expect(subject).toBeInstanceOf(SubjectEntity);
      expect(subject.title).toBe('Mathematics');
      expect(subject.color).toBe('#FF5722');
      expect(subject.userId).toBe('u1');
      expect(mockSubjectRepo.save).toHaveBeenCalledTimes(1);
    });

    it('✅ should use default color when color is not provided', async () => {
      const dto = { title: 'Physics' };

      const subject = await service.createSubject('u1', dto as any);

      expect(subject.color).toBe('#000000');
    });

    it('❌ should propagate repository errors on save', async () => {
      mockSubjectRepo.save.mockRejectedValue(new Error('DB write failed'));

      await expect(service.createSubject('u1', { title: 'Chemistry' } as any))
        .rejects.toThrow('DB write failed');
    });
  });

  describe('updateSubject', () => {
    it('✅ should update subject when user is the owner', async () => {
      mockSubjectRepo.findById.mockResolvedValue(makeSubject({ title: 'Old Title' }));

      await service.updateSubject('u1', 'subj-1', { title: 'New Title' });

      expect(mockSubjectRepo.update).toHaveBeenCalledWith('subj-1', {
        title: 'New Title',
        color: undefined,
      });
    });

    it('❌ should throw NotFoundException when subject does not exist', async () => {
      mockSubjectRepo.findById.mockResolvedValue(null);

      await expect(service.updateSubject('u1', 'nonexistent', { title: 'X' }))
        .rejects.toThrow(NotFoundException);

      expect(mockSubjectRepo.update).not.toHaveBeenCalled();
    });

    it('❌ should throw ForbiddenException when user is not the owner', async () => {
      mockSubjectRepo.findById.mockResolvedValue(makeSubject({ userId: 'other-user' }));

      await expect(service.updateSubject('u1', 'subj-1', { title: 'X' }))
        .rejects.toThrow(ForbiddenException);

      expect(mockSubjectRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteSubject', () => {
    it('✅ should delete subject when user is the owner', async () => {
      mockSubjectRepo.findById.mockResolvedValue(makeSubject());

      await service.deleteSubject('u1', 'subj-1');

      expect(mockSubjectRepo.delete).toHaveBeenCalledWith('subj-1');
    });

    it('❌ should throw NotFoundException when subject does not exist', async () => {
      mockSubjectRepo.findById.mockResolvedValue(null);

      await expect(service.deleteSubject('u1', 'nonexistent'))
        .rejects.toThrow(NotFoundException);

      expect(mockSubjectRepo.delete).not.toHaveBeenCalled();
    });

    it('❌ should throw ForbiddenException when user is not the owner', async () => {
      mockSubjectRepo.findById.mockResolvedValue(makeSubject({ userId: 'other-user' }));

      await expect(service.deleteSubject('u1', 'subj-1'))
        .rejects.toThrow(ForbiddenException);

      expect(mockSubjectRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe('getSubjectsByUser', () => {
    it('✅ should return subjects from repository', async () => {
      const subjects = [makeSubject({ id: 's1', title: 'Math' }), makeSubject({ id: 's2', title: 'Physics' })];
      mockSubjectRepo.findByUserId.mockResolvedValue(subjects);

      const result = await service.getSubjectsByUser('u1');

      expect(result).toEqual(subjects);
      expect(mockSubjectRepo.findByUserId).toHaveBeenCalledWith('u1');
    });

    it('✅ should return empty array when user has no subjects', async () => {
      mockSubjectRepo.findByUserId.mockResolvedValue([]);

      const result = await service.getSubjectsByUser('u1');

      expect(result).toEqual([]);
    });
  });
});

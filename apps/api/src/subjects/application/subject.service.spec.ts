import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { SubjectService } from './subject.service';
import { SubjectEntity } from '../domain/subject.entity';

describe('SubjectService', () => {
  let service: SubjectService;
  let mockSubjectRepo: {
    save: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    findById: jest.Mock;
    findByUserId: jest.Mock;
  };

  beforeEach(async () => {
    mockSubjectRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByUserId: jest.fn(),
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
    it('✅ should create subject via Builder and save to repository', async () => {
      const dto = { title: 'Mathematics', color: '#FF5722' };

      const subjectId = await service.createSubject('u1', dto);

      expect(subjectId).toBeDefined();
      expect(mockSubjectRepo.save).toHaveBeenCalledTimes(1);

      const savedSubject = mockSubjectRepo.save.mock.calls[0][0];
      expect(savedSubject).toBeInstanceOf(SubjectEntity);
      expect(savedSubject.title).toBe('Mathematics');
      expect(savedSubject.color).toBe('#FF5722');
      expect(savedSubject.userId).toBe('u1');
    });

    it('✅ should use default color when color is not provided', async () => {
      const dto = { title: 'Physics' };

      await service.createSubject('u1', dto as any);

      const savedSubject = mockSubjectRepo.save.mock.calls[0][0];
      expect(savedSubject.color).toBe('#000000');
    });

    it('❌ should propagate Builder validation errors (empty title)', async () => {
      const dto = { title: '' };

      await expect(service.createSubject('u1', dto as any))
        .rejects.toThrow('Subject title cannot be empty');

      expect(mockSubjectRepo.save).not.toHaveBeenCalled();
    });

    it('❌ should propagate Builder validation errors (invalid color)', async () => {
      const dto = { title: 'Art', color: 'not-a-hex' };

      await expect(service.createSubject('u1', dto as any))
        .rejects.toThrow('Invalid color format');

      expect(mockSubjectRepo.save).not.toHaveBeenCalled();
    });

    it('❌ should propagate repository errors on save', async () => {
      mockSubjectRepo.save.mockRejectedValue(new Error('DB write failed'));
      const dto = { title: 'Chemistry' };

      await expect(service.createSubject('u1', dto as any))
        .rejects.toThrow('DB write failed');
    });
  });

  describe('updateSubject', () => {
    it('✅ should update subject when user is the owner', async () => {
      mockSubjectRepo.findById.mockResolvedValue(
        new SubjectEntity('subj-1', 'Old Title', 'u1'),
      );

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
      mockSubjectRepo.findById.mockResolvedValue(
        new SubjectEntity('subj-1', 'Title', 'other-user'),
      );

      await expect(service.updateSubject('u1', 'subj-1', { title: 'X' }))
        .rejects.toThrow(ForbiddenException);

      expect(mockSubjectRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteSubject', () => {
    it('✅ should delete subject when user is the owner', async () => {
      mockSubjectRepo.findById.mockResolvedValue(
        new SubjectEntity('subj-1', 'Title', 'u1'),
      );

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
      mockSubjectRepo.findById.mockResolvedValue(
        new SubjectEntity('subj-1', 'Title', 'other-user'),
      );

      await expect(service.deleteSubject('u1', 'subj-1'))
        .rejects.toThrow(ForbiddenException);

      expect(mockSubjectRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe('getSubjectsByUser', () => {
    it('✅ should return subjects from repository', async () => {
      const subjects = [
        new SubjectEntity('s1', 'Math', 'u1'),
        new SubjectEntity('s2', 'Physics', 'u1'),
      ];
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

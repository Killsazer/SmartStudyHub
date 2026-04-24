import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { TeacherEntity, TeacherProps } from '../domain/teacher.entity';
import { CreateTeacherDto } from '../presentation/dto/create-teacher.dto';
import { UpdateTeacherDto } from '../presentation/dto/update-teacher.dto';

describe('TeacherService', () => {
  let service: TeacherService;
  let mockTeacherRepo: any;

  beforeEach(async () => {
    mockTeacherRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
      findByUserId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeacherService,
        { provide: 'ITeacherRepository', useValue: mockTeacherRepo },
      ],
    }).compile();

    service = module.get<TeacherService>(TeacherService);
  });

  describe('createTeacher', () => {
    it('✅ should create a teacher and save it to repository', async () => {
      const dto: CreateTeacherDto = { name: 'Dr. Smith', photoUrl: 'url', contacts: 'email' };
      
      const result = await service.createTeacher('user-1', dto);

      expect(result.id).toBeDefined();
      expect(result.name).toBe('Dr. Smith');
      expect(result.userId).toBe('user-1');
      expect(result.photoUrl).toBe('url');
      expect(result.contacts).toBe('email');
      expect(mockTeacherRepo.save).toHaveBeenCalledWith(result);
    });
  });

  describe('updateTeacher', () => {
    const existingProps: TeacherProps = { id: 't-1', name: 'Old Name', userId: 'user-1' };
    const existingTeacher = new TeacherEntity(existingProps);

    it('✅ should update a teacher if user is the owner', async () => {
      mockTeacherRepo.findById.mockResolvedValue(existingTeacher);
      
      const updatedProps: TeacherProps = { id: 't-1', name: 'New Name', userId: 'user-1' };
      const updatedTeacher = new TeacherEntity(updatedProps);
      mockTeacherRepo.update.mockResolvedValue(updatedTeacher);

      const dto: UpdateTeacherDto = { name: 'New Name' };
      const result = await service.updateTeacher('user-1', 't-1', dto);

      expect(result.name).toBe('New Name');
      expect(mockTeacherRepo.update).toHaveBeenCalledWith('t-1', dto);
    });

    it('❌ should throw NotFoundException if teacher does not exist', async () => {
      mockTeacherRepo.findById.mockResolvedValue(null);

      const dto: UpdateTeacherDto = { name: 'New Name' };
      await expect(service.updateTeacher('user-1', 't-1', dto)).rejects.toThrow(NotFoundException);
    });

    it('❌ should throw ForbiddenException if user is not the owner', async () => {
      mockTeacherRepo.findById.mockResolvedValue(existingTeacher);

      const dto: UpdateTeacherDto = { name: 'New Name' };
      await expect(service.updateTeacher('other-user', 't-1', dto)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteTeacher', () => {
    const existingProps: TeacherProps = { id: 't-1', name: 'Old Name', userId: 'user-1' };
    const existingTeacher = new TeacherEntity(existingProps);

    it('✅ should delete a teacher if user is the owner', async () => {
      mockTeacherRepo.findById.mockResolvedValue(existingTeacher);

      await service.deleteTeacher('user-1', 't-1');

      expect(mockTeacherRepo.delete).toHaveBeenCalledWith('t-1');
    });

    it('❌ should throw NotFoundException if teacher does not exist', async () => {
      mockTeacherRepo.findById.mockResolvedValue(null);

      await expect(service.deleteTeacher('user-1', 't-1')).rejects.toThrow(NotFoundException);
    });

    it('❌ should throw ForbiddenException if user is not the owner', async () => {
      mockTeacherRepo.findById.mockResolvedValue(existingTeacher);

      await expect(service.deleteTeacher('other-user', 't-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getTeachers', () => {
    it('✅ should return all teachers for a specific user', async () => {
      const props: TeacherProps = { id: 't-1', name: 'Teacher', userId: 'user-1' };
      const teacher = new TeacherEntity(props);
      mockTeacherRepo.findByUserId.mockResolvedValue([teacher]);

      const result = await service.getTeachers('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Teacher');
      expect(mockTeacherRepo.findByUserId).toHaveBeenCalledWith('user-1');
    });
  });
});

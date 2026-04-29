import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { NoteService } from './note.service';
import { NoteEntity } from '../domain/note.entity';

describe('NoteService', () => {
  let service: NoteService;
  let mockNoteRepo: any;

  beforeEach(async () => {
    mockNoteRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
      getNotesTree: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoteService,
        { provide: 'INoteRepository', useValue: mockNoteRepo },
      ],
    }).compile();

    service = module.get<NoteService>(NoteService);
  });

  describe('createNote', () => {
    it('✅ should create a note and save it to repository', async () => {
      const dto = { title: 'Lecture 1', content: 'Intro to Clean Architecture', subjectId: 'subj-1' };

      const result = await service.createNote('u1', dto);

      expect(result.id).toBeDefined();
      expect(result.title).toBe('Lecture 1');
      expect(result.userId).toBe('u1');
      expect(result.content).toBe('Intro to Clean Architecture');
      expect(result.subjectId).toBe('subj-1');
      expect(mockNoteRepo.save).toHaveBeenCalledWith(result);
    });

    it('❌ should throw ForbiddenException if trying to create inside someone elses folder', async () => {
      const dto = { title: 'New Note', parentId: 'p-1' };
      const parentNote = new NoteEntity({ id: 'p-1', title: 'Parent Folder', userId: 'other-user' });
      mockNoteRepo.findById.mockResolvedValue(parentNote);

      await expect(service.createNote('u1', dto)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateNote', () => {
    it('✅ should update a note if user is the owner', async () => {
      const existingNote = new NoteEntity({ id: 'n1', title: 'Old Title', userId: 'u1', content: 'Old Content' });
      mockNoteRepo.findById.mockResolvedValue(existingNote);

      const result = await service.updateNote('u1', 'n1', { title: 'New Title', content: 'New Content' });

      expect(result.title).toBe('New Title');
      expect(result.content).toBe('New Content');
      expect(mockNoteRepo.save).toHaveBeenCalledWith(existingNote);
    });

    it('❌ should throw NotFoundException if note does not exist', async () => {
      mockNoteRepo.findById.mockResolvedValue(null);

      await expect(service.updateNote('u1', 'n1', { title: 'New' })).rejects.toThrow(NotFoundException);
    });

    it('❌ should throw ForbiddenException if user is not the owner', async () => {
      const existingNote = new NoteEntity({ id: 'n1', title: 'Title', userId: 'other-user' });
      mockNoteRepo.findById.mockResolvedValue(existingNote);

      await expect(service.updateNote('u1', 'n1', { title: 'New' })).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteNote', () => {
    it('✅ should delete a note if user is the owner', async () => {
      const existingNote = new NoteEntity({ id: 'n1', title: 'Title', userId: 'u1' });
      mockNoteRepo.findById.mockResolvedValue(existingNote);

      await service.deleteNote('u1', 'n1');

      expect(mockNoteRepo.delete).toHaveBeenCalledWith('n1');
    });

    it('❌ should throw NotFoundException if note does not exist', async () => {
      mockNoteRepo.findById.mockResolvedValue(null);

      await expect(service.deleteNote('u1', 'n1')).rejects.toThrow(NotFoundException);
    });

    it('❌ should throw ForbiddenException if user is not the owner', async () => {
      const existingNote = new NoteEntity({ id: 'n1', title: 'Title', userId: 'other-user' });
      mockNoteRepo.findById.mockResolvedValue(existingNote);

      await expect(service.deleteNote('u1', 'n1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getNotesTree', () => {
    it('✅ should build a tree from flat entities and serialize it', async () => {
      const folder = new NoteEntity({ id: 'f1', title: 'Folder 1', userId: 'u1' });
      const standaloneBlock = new NoteEntity({ id: 'b1', title: 'Standalone Block', userId: 'u1', content: 'Content' });
      const childBlock = new NoteEntity({ id: 'b2', title: 'Child Block', userId: 'u1', content: 'Content', parentId: 'f1' });

      mockNoteRepo.getNotesTree.mockResolvedValue([folder, standaloneBlock, childBlock]);

      const result = await service.getNotesTree('u1');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('f1');
      expect(result[0].type).toBe('section');
      expect(result[0].children).toHaveLength(1);
      expect(result[0].children![0].id).toBe('b2');

      expect(result[1].id).toBe('b1');
      expect(result[1].type).toBe('block');
    });
  });
});

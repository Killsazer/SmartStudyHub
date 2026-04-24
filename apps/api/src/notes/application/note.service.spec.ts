import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { NoteService } from './note.service';
import { NoteEntity } from '../domain/note.entity';
import { NoteSection } from '../domain/patterns/composite/note-section';
import { NoteBlock } from '../domain/patterns/composite/note-block';

describe('NoteService', () => {
  let service: NoteService;
  let mockNoteRepo: any;

  beforeEach(async () => {
    mockNoteRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
      findByUserId: jest.fn(),
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
      const parentNote = new NoteEntity('p-1', 'Parent Folder', 'other-user');
      mockNoteRepo.findById.mockResolvedValue(parentNote);

      await expect(service.createNote('u1', dto)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateNote', () => {
    it('✅ should update a note if user is the owner', async () => {
      const existingNote = new NoteEntity('n1', 'Old Title', 'u1', 'Old Content');
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
      const existingNote = new NoteEntity('n1', 'Title', 'other-user');
      mockNoteRepo.findById.mockResolvedValue(existingNote);

      await expect(service.updateNote('u1', 'n1', { title: 'New' })).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteNote', () => {
    it('✅ should delete a note if user is the owner', async () => {
      const existingNote = new NoteEntity('n1', 'Title', 'u1');
      mockNoteRepo.findById.mockResolvedValue(existingNote);

      await service.deleteNote('u1', 'n1');

      expect(mockNoteRepo.delete).toHaveBeenCalledWith('n1');
    });

    it('❌ should throw NotFoundException if note does not exist', async () => {
      mockNoteRepo.findById.mockResolvedValue(null);

      await expect(service.deleteNote('u1', 'n1')).rejects.toThrow(NotFoundException);
    });

    it('❌ should throw ForbiddenException if user is not the owner', async () => {
      const existingNote = new NoteEntity('n1', 'Title', 'other-user');
      mockNoteRepo.findById.mockResolvedValue(existingNote);

      await expect(service.deleteNote('u1', 'n1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getNotesTree', () => {
    it('✅ should reconstruct and serialize the tree from composite roots', async () => {
      const root1 = new NoteSection('f1', 'Folder 1');
      const root2 = new NoteBlock('b1', 'Standalone Block', 'Content');
      
      const childBlock = new NoteBlock('b2', 'Child Block', 'Content');
      root1.add(childBlock);

      mockNoteRepo.getNotesTree.mockResolvedValue([root1, root2]);

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

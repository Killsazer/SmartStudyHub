// File: src/notes/application/note.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { NoteService } from './note.service';
import { NoteEntity } from '../domain/note.entity';

describe('NoteService', () => {
  let service: NoteService;
  let mockNoteRepo: any;

  beforeEach(async () => {
    mockNoteRepo = {
      save: jest.fn(),
      findByUserId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoteService,
        { provide: 'INoteRepository', useValue: mockNoteRepo },
      ],
    }).compile();

    service = module.get<NoteService>(NoteService);
    jest.clearAllMocks();
  });

  // ──────────────── CREATE NOTE ────────────────

  describe('createNote', () => {
    it('✅ should create a note and save it to repository', async () => {
      const dto = { title: 'Lecture 1', content: 'Intro to Clean Architecture', subjectId: 'subj-1' };
      
      const result = await service.createNote('u1', dto);

      expect(mockNoteRepo.save).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(NoteEntity);
      expect(result.title).toBe('Lecture 1');
      expect(result.content).toBe('Intro to Clean Architecture');
      expect(result.userId).toBe('u1');
      expect(result.id).toMatch(/^note-/);
    });

    it('✅ should create a child note with parentId', async () => {
      const dto = { title: 'Sub-note', content: 'Details', parentId: 'folder-1' };
      
      const result = await service.createNote('u1', dto);

      expect(result.parentId).toBe('folder-1');
    });

    it('✅ should create a section (folder) without content', async () => {
      const dto = { title: 'Chapter 1 Folder' };
      
      const result = await service.createNote('u1', dto as any);

      expect(result.title).toBe('Chapter 1 Folder');
      expect(result.content).toBeUndefined();
    });

    it('🔄 should propagate repository save errors', async () => {
      mockNoteRepo.save.mockRejectedValue(new Error('DB write failed'));
      
      await expect(service.createNote('u1', { title: 'Test' } as any))
        .rejects.toThrow('DB write failed');
    });
  });

  // ──────────────── GET NOTES TREE (Composite Pattern) ────────────────

  describe('getNotesTree', () => {
    it('✅ should reconstruct a 2-level Composite tree (Section → Block)', async () => {
      const folder = new NoteEntity('folder-1', 'Chapter 1', 'u1', undefined);
      const block1 = new NoteEntity('block-1', 'Note A', 'u1', 'Content of A', 'folder-1');
      const block2 = new NoteEntity('block-2', 'Note B', 'u1', 'Content of B', 'folder-1');
      
      mockNoteRepo.findByUserId.mockResolvedValue([folder, block1, block2]);
      
      const tree = await service.getNotesTree('u1');
      
      expect(tree.length).toBe(1); // Only the root folder
      expect(tree[0].type).toBe('section');
      expect(tree[0].title).toBe('Chapter 1');
      expect(tree[0].children.length).toBe(2);
      expect(tree[0].children[0].type).toBe('block');
      expect(tree[0].children[1].type).toBe('block');
    });

    it('✅ should place root blocks (no parentId) as separate tree roots', async () => {
      const rootBlock = new NoteEntity('b1', 'Standalone Note', 'u1', 'Some content');
      const folder = new NoteEntity('f1', 'Folder', 'u1', undefined);
      
      mockNoteRepo.findByUserId.mockResolvedValue([rootBlock, folder]);
      
      const tree = await service.getNotesTree('u1');
      
      expect(tree.length).toBe(2);
      const blockNode = tree.find(n => n.id === 'b1');
      expect(blockNode!.type).toBe('block');
      expect(blockNode!.content).toBe('Some content');
    });

    it('✅ should handle 3-level deep nesting', async () => {
      const root = new NoteEntity('root', 'Root Section', 'u1', undefined);
      const child = new NoteEntity('child', 'Child Section', 'u1', undefined, 'root');
      const leaf = new NoteEntity('leaf', 'Deep Leaf', 'u1', 'Deep content', 'child');
      
      mockNoteRepo.findByUserId.mockResolvedValue([root, child, leaf]);
      
      const tree = await service.getNotesTree('u1');
      
      expect(tree.length).toBe(1);
      expect(tree[0].children.length).toBe(1);
      expect(tree[0].children[0].id).toBe('child');
      expect(tree[0].children[0].children.length).toBe(1);
      expect(tree[0].children[0].children[0].id).toBe('leaf');
      expect(tree[0].children[0].children[0].content).toBe('Deep content');
    });

    it('🔄 should return empty array when no notes exist', async () => {
      mockNoteRepo.findByUserId.mockResolvedValue([]);
      
      const tree = await service.getNotesTree('u1');
      
      expect(tree).toEqual([]);
    });

    it('🔄 should treat orphaned children (invalid parentId) as root nodes', async () => {
      // parentId points to a non-existent note
      const orphan = new NoteEntity('o1', 'Orphan', 'u1', 'Lost', 'deleted-parent-id');
      
      mockNoteRepo.findByUserId.mockResolvedValue([orphan]);
      
      const tree = await service.getNotesTree('u1');
      
      // Orphan should become a root node (since parent doesn't exist)
      expect(tree.length).toBe(1);
      expect(tree[0].id).toBe('o1');
    });

    it('🔄 should correctly output INoteNode JSON structure', async () => {
      const block = new NoteEntity('b1', 'Test', 'u1', 'Body');
      mockNoteRepo.findByUserId.mockResolvedValue([block]);
      
      const tree = await service.getNotesTree('u1');
      
      // Verify the exact INoteNode shape
      expect(tree[0]).toEqual({
        id: 'b1',
        type: 'block',
        title: 'Test',
        content: 'Body',
        subjectId: null
      });
    });
  });
});

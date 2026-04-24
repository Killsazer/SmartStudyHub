import { NoteBlock } from './note-block';
import { NoteSection } from './note-section';

describe('Composite Pattern — Notes', () => {
  describe('NoteBlock (Leaf)', () => {
    it('✅ should create a block with correct properties', () => {
      const block = new NoteBlock('1', 'Leaf Node', 'Content here', 'subj-1');
      expect(block.id).toBe('1');
      expect(block.title).toBe('Leaf Node');
      expect(block.content).toBe('Content here');
      expect(block.subjectId).toBe('subj-1');
    });

    it('✅ should update content via setter', () => {
      const block = new NoteBlock('1', 'Title', 'Old');
      block.content = 'New';
      expect(block.content).toBe('New');
    });

    it('✅ getItemCount should return 1', () => {
      const block = new NoteBlock('1', 'Title', 'Content');
      expect(block.getItemCount()).toBe(1);
    });

    it('❌ should throw error when trying to add a child', () => {
      const block = new NoteBlock('1', 'Title', 'Content');
      const child = new NoteBlock('2', 'Child', 'Content');
      expect(() => block.add(child)).toThrow('This component does not support adding children.');
    });

    it('❌ should throw error when trying to remove a child', () => {
      const block = new NoteBlock('1', 'Title', 'Content');
      expect(() => block.remove('2')).toThrow('This component does not support removing children.');
    });

    it('✅ toJSON should return correct structure', () => {
      const block = new NoteBlock('1', 'Title', 'Content');
      expect(block.toJSON()).toEqual({
        id: '1',
        type: 'block',
        title: 'Title',
        content: 'Content',
        subjectId: null,
      });
    });
  });

  describe('NoteSection (Composite)', () => {
    it('✅ should create a section with correct properties and empty children', () => {
      const section = new NoteSection('1', 'Root Folder', 'subj-1');
      expect(section.id).toBe('1');
      expect(section.title).toBe('Root Folder');
      expect(section.subjectId).toBe('subj-1');
      expect(section.getChildren()).toHaveLength(0);
    });

    it('✅ should add child components', () => {
      const section = new NoteSection('1', 'Root');
      const childBlock = new NoteBlock('2', 'Child 1', 'Content');
      const childSection = new NoteSection('3', 'Child Folder');

      section.add(childBlock);
      section.add(childSection);

      expect(section.getChildren()).toHaveLength(2);
      expect(section.getChildren()[0]).toBe(childBlock);
      expect(section.getChildren()[1]).toBe(childSection);
    });

    it('✅ should remove child component by id', () => {
      const section = new NoteSection('1', 'Root');
      const childBlock = new NoteBlock('2', 'Child 1', 'Content');
      
      section.add(childBlock);
      expect(section.getChildren()).toHaveLength(1);

      section.remove('2');
      expect(section.getChildren()).toHaveLength(0);
    });

    it('✅ getItemCount should recursively sum items', () => {
      const root = new NoteSection('1', 'Root');
      const childFolder = new NoteSection('2', 'Folder 1');
      const block1 = new NoteBlock('3', 'Block 1', 'Content 1');
      const block2 = new NoteBlock('4', 'Block 2', 'Content 2');
      const block3 = new NoteBlock('5', 'Block 3', 'Content 3');

      childFolder.add(block1);
      childFolder.add(block2);
      root.add(childFolder);
      root.add(block3);

      expect(root.getItemCount()).toBe(3);
    });

    it('✅ toJSON should recursively serialize children', () => {
      const root = new NoteSection('1', 'Root');
      const childFolder = new NoteSection('2', 'Folder 1');
      const block1 = new NoteBlock('3', 'Block 1', 'Content 1');

      childFolder.add(block1);
      root.add(childFolder);

      const json = root.toJSON();
      
      expect(json.id).toBe('1');
      expect(json.type).toBe('section');
      expect(json.children).toHaveLength(1);
      
      const childJson = json.children![0];
      expect(childJson.id).toBe('2');
      expect(childJson.type).toBe('section');
      expect(childJson.children).toHaveLength(1);

      const blockJson = childJson.children![0];
      expect(blockJson.id).toBe('3');
      expect(blockJson.type).toBe('block');
      expect(blockJson.content).toBe('Content 1');
    });
  });
});

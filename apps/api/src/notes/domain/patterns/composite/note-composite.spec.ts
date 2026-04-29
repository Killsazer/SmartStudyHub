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

    it('✅ getWordCount counts whitespace-separated words', () => {
      expect(new NoteBlock('1', 'T', 'hello world').getWordCount()).toBe(2);
      expect(new NoteBlock('1', 'T', '  hello   world  ').getWordCount()).toBe(2);
      expect(new NoteBlock('1', 'T', 'one').getWordCount()).toBe(1);
    });

    it('✅ getWordCount returns 0 for empty or whitespace-only content', () => {
      expect(new NoteBlock('1', 'T', '').getWordCount()).toBe(0);
      expect(new NoteBlock('1', 'T', '   ').getWordCount()).toBe(0);
    });

    it('✅ getEstimatedReadingMinutes uses 200 WPM and rounds up', () => {
      const oneWord = new NoteBlock('1', 'T', 'word');
      expect(oneWord.getEstimatedReadingMinutes()).toBe(1);

      const empty = new NoteBlock('2', 'T', '');
      expect(empty.getEstimatedReadingMinutes()).toBe(0);

      const exactlyTwoHundred = new NoteBlock('3', 'T', Array(200).fill('w').join(' '));
      expect(exactlyTwoHundred.getEstimatedReadingMinutes()).toBe(1);

      const justOver = new NoteBlock('4', 'T', Array(201).fill('w').join(' '));
      expect(justOver.getEstimatedReadingMinutes()).toBe(2);
    });

    it('✅ toJSON should return correct structure with metrics', () => {
      const block = new NoteBlock('1', 'Title', 'one two three');
      expect(block.toJSON()).toEqual({
        id: '1',
        type: 'block',
        title: 'Title',
        content: 'one two three',
        subjectId: null,
        wordCount: 3,
        readingMinutes: 1,
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

    it('✅ getWordCount should recursively sum word counts of leaves', () => {
      const root = new NoteSection('1', 'Root');
      const childFolder = new NoteSection('2', 'Folder');
      const inner = new NoteBlock('3', 'Inner', 'one two three');
      const sibling = new NoteBlock('4', 'Sibling', 'four five');

      childFolder.add(inner);
      root.add(childFolder);
      root.add(sibling);

      expect(childFolder.getWordCount()).toBe(3);
      expect(root.getWordCount()).toBe(5);
    });

    it('✅ getEstimatedReadingMinutes should recursively sum children minutes', () => {
      const root = new NoteSection('1', 'Root');
      const block1 = new NoteBlock('2', 'B1', Array(150).fill('w').join(' '));
      const block2 = new NoteBlock('3', 'B2', Array(150).fill('w').join(' '));

      root.add(block1);
      root.add(block2);

      expect(block1.getEstimatedReadingMinutes()).toBe(1);
      expect(block2.getEstimatedReadingMinutes()).toBe(1);
      expect(root.getEstimatedReadingMinutes()).toBe(2);
    });

    it('✅ empty section reports zero metrics', () => {
      const empty = new NoteSection('1', 'Empty');
      expect(empty.getWordCount()).toBe(0);
      expect(empty.getEstimatedReadingMinutes()).toBe(0);
    });

    it('✅ toJSON should recursively serialize children with metrics', () => {
      const root = new NoteSection('1', 'Root');
      const childFolder = new NoteSection('2', 'Folder 1');
      const block1 = new NoteBlock('3', 'Block 1', 'one two');

      childFolder.add(block1);
      root.add(childFolder);

      const json = root.toJSON();

      expect(json.id).toBe('1');
      expect(json.type).toBe('section');
      expect(json.wordCount).toBe(2);
      expect(json.readingMinutes).toBe(1);
      expect(json.children).toHaveLength(1);

      const childJson = json.children![0];
      expect(childJson.id).toBe('2');
      expect(childJson.type).toBe('section');
      expect(childJson.wordCount).toBe(2);
      expect(childJson.children).toHaveLength(1);

      const blockJson = childJson.children![0];
      expect(blockJson.id).toBe('3');
      expect(blockJson.type).toBe('block');
      expect(blockJson.content).toBe('one two');
      expect(blockJson.wordCount).toBe(2);
      expect(blockJson.readingMinutes).toBe(1);
    });
  });
});

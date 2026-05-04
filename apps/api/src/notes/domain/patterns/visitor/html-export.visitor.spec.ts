import { HtmlExportVisitor } from './html-export.visitor';
import { NoteSection } from '../composite/note-section';
import { NoteBlock } from '../composite/note-block';

describe('HtmlExportVisitor', () => {
  let visitor: HtmlExportVisitor;

  beforeEach(() => {
    visitor = new HtmlExportVisitor();
  });

  describe('visitBlock', () => {
    it('✅ should render block as <article> with heading and content', () => {
      const block = new NoteBlock('b1', 'My Note', '<p>Hello</p>', 'subj-1');
      const html = block.accept(visitor, 0);

      expect(html).toContain('<article');
      expect(html).toContain('class="note-block depth-0"');
      expect(html).toContain('<h1 class="block-title">My Note</h1>');
      expect(html).toContain('<p>Hello</p>');
    });

    it('✅ should include word count and reading minutes in meta', () => {
      const block = new NoteBlock('b1', 'Title', 'one two three four five', null);
      const html = block.accept(visitor, 0);

      expect(html).toContain('5 words');
      expect(html).toContain('~1 min read');
    });

    it('✅ should escape title HTML entities to prevent injection', () => {
      const block = new NoteBlock('b1', '<script>alert(1)</script>', 'safe', null);
      const html = block.accept(visitor, 0);

      expect(html).not.toContain('<script>alert(1)</script>');
      expect(html).toContain('&lt;script&gt;');
    });

    it('✅ should fall back to placeholder when content is empty', () => {
      const block = new NoteBlock('b1', 'Empty', '', null);
      const html = block.accept(visitor, 0);

      expect(html).toContain('<em>(empty)</em>');
    });

    it('✅ should clamp heading level to h6 at deep nesting', () => {
      const block = new NoteBlock('b1', 'Deep', 'x', null);
      const html = block.accept(visitor, 10);

      expect(html).toContain('<h6 class="block-title">Deep</h6>');
    });
  });

  describe('visitSection', () => {
    it('✅ should render section as <section> with heading at depth-based level', () => {
      const section = new NoteSection('s1', 'Top Section', 'subj-1');
      const html = section.accept(visitor, 0);

      expect(html).toContain('<section');
      expect(html).toContain('class="note-section depth-0"');
      expect(html).toContain('<h1 class="section-title">Top Section</h1>');
    });

    it('✅ nested section should use higher heading level', () => {
      const child = new NoteSection('s2', 'Child Section', null);
      const html = child.accept(visitor, 2);

      expect(html).toContain('<h3 class="section-title">Child Section</h3>');
    });

    it('✅ empty section should render placeholder', () => {
      const section = new NoteSection('s1', 'Empty', null);
      const html = section.accept(visitor, 0);

      expect(html).toContain('<p class="empty-section">— empty —</p>');
    });

    it('✅ should recursively render children with incremented depth', () => {
      const root = new NoteSection('s1', 'Root', null);
      const child = new NoteBlock('b1', 'Inside', 'content', null);
      root.add(child);

      const html = root.accept(visitor, 0);

      expect(html).toContain('<h1 class="section-title">Root</h1>');
      expect(html).toContain('class="note-block depth-1"');
      expect(html).toContain('<h2 class="block-title">Inside</h2>');
    });

    it('✅ should escape section title to prevent HTML injection', () => {
      const section = new NoteSection('s1', '<img src=x onerror=alert(1)>', null);
      const html = section.accept(visitor, 0);

      expect(html).not.toContain('<img src=x onerror=alert(1)>');
      expect(html).toContain('&lt;img');
    });
  });

  describe('Composite + Visitor integration', () => {
    it('✅ should render a multi-level tree end-to-end', () => {
      const root = new NoteSection('root', 'Course', null);
      const lecture = new NoteSection('lec', 'Lecture 1', null);
      const note = new NoteBlock('n1', 'Key Point', '<p>Important</p>', null);
      lecture.add(note);
      root.add(lecture);

      const html = root.accept(visitor, 0);

      expect(html).toContain('<h1 class="section-title">Course</h1>');
      expect(html).toContain('<h2 class="section-title">Lecture 1</h2>');
      expect(html).toContain('<h3 class="block-title">Key Point</h3>');
      expect(html).toContain('<p>Important</p>');
    });
  });
});

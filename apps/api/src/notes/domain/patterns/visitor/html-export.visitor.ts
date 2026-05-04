import { Injectable } from '@nestjs/common';
import { INoteVisitor } from './note.visitor';
import { NoteSection } from '../composite/note-section';
import { NoteBlock } from '../composite/note-block';

@Injectable()
export class HtmlExportVisitor implements INoteVisitor<string> {
  visitSection(section: NoteSection, depth: number): string {
    const headingLevel = Math.min(depth + 1, 6);
    const childrenHtml = section
      .getChildren()
      .map((child) => child.accept(this, depth + 1))
      .join('\n');

    return `
      <section class="note-section depth-${depth}">
        <h${headingLevel} class="section-title">${this.escape(section.title)}</h${headingLevel}>
        ${childrenHtml || '<p class="empty-section">— empty —</p>'}
      </section>
    `;
  }

  visitBlock(block: NoteBlock, depth: number): string {
    const headingLevel = Math.min(depth + 1, 6);
    const meta = `${block.getWordCount()} words · ~${block.getEstimatedReadingMinutes()} min read`;

    return `
      <article class="note-block depth-${depth}">
        <h${headingLevel} class="block-title">${this.escape(block.title)}</h${headingLevel}>
        <div class="block-meta">${meta}</div>
        <div class="block-content">${block.content || '<em>(empty)</em>'}</div>
      </article>
    `;
  }

  private escape(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}

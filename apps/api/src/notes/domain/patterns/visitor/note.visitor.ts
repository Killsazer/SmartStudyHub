import { NoteSection } from '../composite/note-section';
import { NoteBlock } from '../composite/note-block';

export interface INoteVisitor<TResult> {
  visitSection(section: NoteSection, depth: number): TResult;
  visitBlock(block: NoteBlock, depth: number): TResult;
}

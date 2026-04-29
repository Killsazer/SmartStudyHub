import { NoteEntity } from '../domain/note.entity';
import { NoteComponent } from '../domain/patterns/composite/note-component';
import { NoteBlock } from '../domain/patterns/composite/note-block';
import { NoteSection } from '../domain/patterns/composite/note-section';

export class NoteTreeBuilder {
  static build(entities: NoteEntity[]): NoteComponent[] {
    const map = new Map<string, NoteComponent>();
    const roots: NoteComponent[] = [];

    entities.forEach(n => {
      const component = n.content
        ? new NoteBlock(n.id, n.title, n.content, n.subjectId ?? null)
        : new NoteSection(n.id, n.title, n.subjectId ?? null);
      map.set(n.id, component);
    });

    entities.forEach(n => {
      const component = map.get(n.id)!;
      if (n.parentId && map.has(n.parentId)) {
        const parent = map.get(n.parentId)!;
        if (parent instanceof NoteSection) {
          parent.add(component);
        }
      } else {
        roots.push(component);
      }
    });

    return roots;
  }
}

export class NoteEntity {
  constructor(
    public readonly id: string,
    public title: string,
    public readonly userId: string,
    public content?: string,
    public parentId?: string,
    public subjectId?: string,
  ) {}
}

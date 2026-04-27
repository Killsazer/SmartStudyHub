export interface NoteProps {
  id: string;
  title: string;
  userId: string;
  content?: string;
  parentId?: string;
  subjectId?: string;
}

export class NoteEntity {
  public readonly id: string;
  public title: string;
  public readonly userId: string;
  public content?: string;
  public parentId?: string;
  public subjectId?: string;

  constructor(props: NoteProps) {
    this.id = props.id;
    this.title = props.title;
    this.userId = props.userId;
    this.content = props.content;
    this.parentId = props.parentId;
    this.subjectId = props.subjectId;
  }
}

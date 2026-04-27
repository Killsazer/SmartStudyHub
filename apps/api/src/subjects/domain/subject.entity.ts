export interface SubjectProps {
  id: string;
  title: string;
  userId: string;
  color?: string;
}

export class SubjectEntity {
  public readonly id: string;
  public title: string;
  public readonly userId: string;
  public color: string;

  constructor(props: SubjectProps) {
    this.id = props.id;
    this.title = props.title;
    this.userId = props.userId;
    this.color = props.color ?? '#000000';
  }
}

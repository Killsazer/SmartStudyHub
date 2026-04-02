export interface TeacherProps {
  id: string;
  name: string;
  userId: string;
  photoUrl?: string;
  contacts?: string;
}

export class TeacherEntity {
  public readonly id: string;
  public name: string;
  public readonly userId: string;
  public photoUrl?: string;
  public contacts?: string;

  constructor(props: TeacherProps) {
    this.id = props.id;
    this.name = props.name;
    this.userId = props.userId;
    this.photoUrl = props.photoUrl;
    this.contacts = props.contacts;
  }

  getAvatarUrl(): string {
    if (this.photoUrl) return this.photoUrl;
    const encoded = encodeURIComponent(this.name);
    return `https://ui-avatars.com/api/?name=${encoded}&background=6366f1&color=fff&size=128`;
  }
}
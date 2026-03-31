// File: src/schedule/domain/teacher.entity.ts
export class TeacherEntity {
  constructor(
    public readonly id: string,
    public name: string,
    public readonly userId: string,
    public photoUrl?: string,
    public contacts?: string,
  ) {}

  /**
   * Returns an avatar URL — either the uploaded photoUrl
   * or a generated one from ui-avatars.com based on the teacher's name.
   */
  getAvatarUrl(): string {
    if (this.photoUrl) return this.photoUrl;
    const encoded = encodeURIComponent(this.name);
    return `https://ui-avatars.com/api/?name=${encoded}&background=6366f1&color=fff&size=128`;
  }
}

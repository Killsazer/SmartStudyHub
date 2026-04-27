import { SubjectEntity } from '../subject.entity';

export class SubjectBuilder {
  private color: string = '#000000';

  constructor(
    private readonly id: string,
    private readonly title: string,
    private readonly userId: string,
  ) {
    if (!title || title.trim().length === 0) {
      throw new Error('Subject title cannot be empty');
    }
    if (title.length > 100) {
      throw new Error(`Subject title too long: ${title.length} chars (max 100)`);
    }
    if (!userId || userId.trim().length === 0) {
      throw new Error('Subject userId cannot be empty');
    }
  }

  setColor(color: string): SubjectBuilder {
    const hexRegex = /^#([0-9A-F]{3}){1,2}$/i;
    if (!hexRegex.test(color)) {
      throw new Error(`Invalid color format: ${color}. Must be a valid HEX.`);
    }
    this.color = color;
    return this;
  }

  build(): SubjectEntity {
    return new SubjectEntity({
      id: this.id,
      title: this.title.trim(),
      userId: this.userId,
      color: this.color,
    });
  }
}

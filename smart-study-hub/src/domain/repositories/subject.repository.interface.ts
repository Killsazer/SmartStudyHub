import { SubjectEntity } from '../entities/subject.entity';

export interface ISubjectRepository {
  save(subject: SubjectEntity): Promise<void>;

  /**
   * Отримує список предметів та пов'язаних сутностей для конкретного користувача (Query of CQRS).
   * Повертаємо any[] або DTO, оскільки мапити назад у Domain-сутності для Read-операції є надлишковим.
   */
  findByUserId(userId: string): Promise<any[]>;
}

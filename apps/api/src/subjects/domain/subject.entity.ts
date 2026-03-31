// File: src/subjects/domain/subject.entity.ts

/**
 * Domain entity representing a study subject.
 *
 * Aggregate-level collections (scheduleSlots, tasks, notes) use `unknown[]`
 * intentionally to avoid coupling the Subject domain to other bounded contexts.
 * Concrete types are resolved at the infrastructure layer during persistence.
 */
export class SubjectEntity {
  public color: string = '#000000';
  public scheduleSlots: unknown[] = [];
  public tasks: unknown[] = [];
  public notes: unknown[] = [];

  constructor(
    public readonly id: string,
    public title: string,
    public readonly userId: string,
  ) {}
}

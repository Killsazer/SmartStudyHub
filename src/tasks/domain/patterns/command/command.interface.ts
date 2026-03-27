// File: src/tasks/domain/patterns/command/command.interface.ts
export interface ICommand {
  execute(): void;
  undo(): void;
}

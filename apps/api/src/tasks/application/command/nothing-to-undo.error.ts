export class NothingToUndoError extends Error {
  constructor() {
    super('Nothing to undo');
    this.name = 'NothingToUndoError';
  }
}

export class SlotValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SlotValidationError';
  }
}

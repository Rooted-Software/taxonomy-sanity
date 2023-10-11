export class FriendlyError extends Error {
    constructor(errorMessage: string) {
      super(errorMessage);
      this.name = 'FriendlyError';
    }
  }
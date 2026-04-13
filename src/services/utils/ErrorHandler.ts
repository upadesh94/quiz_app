export class ErrorHandler {
  static toMessage(error: unknown) {
    if (error instanceof Error) {
      return error.message;
    }
    return 'Something went wrong';
  }
}

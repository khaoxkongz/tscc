export class HttpError extends Error {
  constructor(public statusCode: number, public override message: string) {
    super(message);
    this.name = 'HttpError';
  }
}

export class ValidationError extends HttpError {
  constructor(public override message: string) {
    super(400, message);
    this.name = 'ValidationError';
  }
}

import { HttpError } from './http.error';

export class UnauthorisedError extends HttpError {
  constructor(context: string = 'Action not allowed') {
    super(UnauthorisedError.name, 403, context);
    Object.setPrototypeOf(this, UnauthorisedError.prototype);
  }
}

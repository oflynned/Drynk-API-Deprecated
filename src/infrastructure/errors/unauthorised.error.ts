import { HttpError } from './http.error';

export class UnauthorisedError extends HttpError {
  constructor(context: string) {
    super(UnauthorisedError.name, 403, context);
  }
}

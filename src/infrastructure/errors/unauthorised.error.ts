import { HttpError } from './http.error';

export class UnauthorisedError extends HttpError {
  constructor(context: string) {
    super('Action is unauthorised', 403, context);
  }
}

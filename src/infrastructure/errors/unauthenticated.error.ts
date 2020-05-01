import { HttpError } from './http.error';

export class UnauthenticatedError extends HttpError {
  constructor(context: string) {
    super('Request is unauthenticated', 401, context);
  }
}

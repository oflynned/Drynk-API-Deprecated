import { HttpError } from './http.error';

export class UnauthenticatedError extends HttpError {
  constructor(
    context: string = 'Unable to ascertain a resource for this account'
  ) {
    super('Unauthenticated request', 401, context);
  }
}

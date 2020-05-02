import { HttpError } from './http.error';

export class UnauthenticatedError extends HttpError {
  constructor(
    context: string = 'Unable to ascertain a resource for this account'
  ) {
    super(UnauthenticatedError.name, 401, context);
  }
}

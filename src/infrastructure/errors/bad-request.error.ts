import { HttpError } from './http.error';

export class BadRequestError extends HttpError {
  constructor(context: string) {
    super('Bad request', 400, context);
  }
}

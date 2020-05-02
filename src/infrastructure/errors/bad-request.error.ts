import { HttpError } from './http.error';

export class BadRequestError extends HttpError {
  constructor(context: string = 'Payload was malformed') {
    super('Bad request', 400, context);
  }
}

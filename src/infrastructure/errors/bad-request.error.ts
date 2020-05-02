import { HttpError } from './http.error';

export class BadRequestError extends HttpError {
  constructor(context: string = 'Payload was malformed') {
    super(BadRequestError.name, 400, context);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

import { HttpError } from './http.error';

export class ServiceDownError extends HttpError {
  constructor(context: string) {
    super(ServiceDownError.name, 503, context);
    Object.setPrototypeOf(this, ServiceDownError.prototype);
  }
}

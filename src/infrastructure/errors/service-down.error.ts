import { HttpError } from './http.error';

export class ServiceDownError extends HttpError {
  constructor(context: string) {
    super('Service is down', 503, context);
  }
}

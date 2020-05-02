import { HttpError } from './http.error';

export class ResourceNotFoundError extends HttpError {
  constructor(context: string = 'Resource does not exist') {
    super(ResourceNotFoundError.name, 404, context);
  }
}

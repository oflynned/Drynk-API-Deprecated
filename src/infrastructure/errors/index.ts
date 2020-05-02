import { BadRequestError } from './bad-request.error';
import { UnauthenticatedError } from './unauthenticated.error';
import { UnauthorisedError } from './unauthorised.error';
import { ResourceNotFoundError } from './resource-not-found.error';
import { ServiceDownError } from './service-down.error';

export {
  BadRequestError, // 400
  UnauthenticatedError, // 401
  UnauthorisedError, // 403
  ResourceNotFoundError, // 404
  ServiceDownError // 503
};

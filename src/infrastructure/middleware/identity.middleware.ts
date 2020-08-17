import { NextFunction, Request, Response } from 'express';
import { Repository } from 'mongoize-orm';
import { User } from '../../models/user.model';

import { auth } from 'firebase-admin';
import DecodedIdToken = auth.DecodedIdToken;
import {
  AuthenticatedRequest,
  SocialProviderHeader,
  SocialRequest
} from './authenticated.request';
import {
  ResourceNotFoundError,
  ServiceDownError,
  UnauthenticatedError,
  UnauthorisedError
} from '../errors';
import { Environment } from '../../config/environment';

export const withUser = async (
  req: SocialRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const firebaseId = req.provider.providerId;
  const user = await Repository.with(User).findOne({
    providerId: firebaseId
  } as object);

  if (user) {
    await user.updateLastActiveAt();
    await user.refresh();
    Object.assign(req, { user });
  }

  next();
};

// TODO requireUser & withUser are really similar aside from the operator on user
export const requireUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const firebaseId = req.provider.providerId;
  const user = await User.findByProviderId(firebaseId);

  if (!user || user.toJson().deleted) {
    throw new ResourceNotFoundError();
  }

  await user.updateLastActiveAt();
  await user.refresh();
  Object.assign(req, { user });

  next();
};

export type GqlContext = {
  user: User;
};

export const authGqlContext = async (req: Request): Promise<GqlContext> => {
  if (Environment.isDevelopment()) {
    // deepcode ignore NoHardcodedCredentials
    const user = await Repository.with(User).findOne({
      email: 'oflynned@gmail.com'
    });
    return { user };
  }

  const jwtToken = req.headers.authorization;
  if (!jwtToken) {
    throw new UnauthenticatedError('Authorization is a required header');
  }

  if (Array.isArray(jwtToken)) {
    throw new UnauthenticatedError('Authorization header cannot be an array');
  }

  // TODO check for revocation
  const [realm, token] = jwtToken.split(' ');
  if (realm !== 'Bearer') {
    throw new UnauthenticatedError('Authorisation must be a bearer token');
  }

  let providerId: DecodedIdToken;

  try {
    // TODO create a cache so that tokens aren't checked on every request since they have expiry timestamps
    //      perhaps something with Redis?
    providerId = await auth().verifyIdToken(token, true);
  } catch (e) {
    if (String(e.message).indexOf('Firebase ID token has expired.') > -1) {
      throw new UnauthorisedError('Firebase token has expired');
    }

    throw new ServiceDownError(
      'Firebase token verification is experiencing downtime'
    );
  }

  const user = await User.findByProviderId(providerId.uid);
  if (!user || user.toJson().deleted) {
    throw new ResourceNotFoundError();
  }

  await user.updateLastActiveAt();
  await user.refresh();

  return { user };
};

export const withFirebaseUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const jwtToken = req.headers['authorization'];
  if (!jwtToken) {
    throw new UnauthenticatedError('Authorization is a required header');
  }

  if (Array.isArray(jwtToken)) {
    throw new UnauthenticatedError('Authorization header cannot be an array');
  }

  // TODO check for revocation
  const [realm, token] = jwtToken.split(' ');
  if (realm !== 'Bearer') {
    throw new UnauthenticatedError('Authorisation must be a bearer token');
  }

  if (!token) {
    throw new UnauthenticatedError(
      'Authorisation must include a bearer token value'
    );
  }

  try {
    const decodedIdToken: DecodedIdToken = await auth().verifyIdToken(
      token,
      true
    );
    const headers: SocialProviderHeader = {
      provider: {
        providerId: decodedIdToken.uid
      }
    };

    Object.assign(req, { ...headers });
  } catch (e) {
    if (String(e.message).indexOf('Firebase ID token has expired.') > -1) {
      throw new UnauthorisedError('Firebase token has expired');
    }

    throw new ServiceDownError(
      'Firebase token verification is experiencing downtime'
    );
  }

  next();
};

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
  BadRequestError,
  ServiceDownError,
  UnauthenticatedError,
  UnauthorisedError
} from '../errors';

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
    Object.assign(req, { user });
  }

  next();
};

export const requireUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    throw new UnauthenticatedError();
  }

  next();
};

export const withFirebaseUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const jwtToken = req.headers['authorization'];
  if (!jwtToken) {
    throw new BadRequestError('Authorization is a required header');
  }

  if (Array.isArray(jwtToken)) {
    throw new BadRequestError('Authorization header cannot be an array');
  }

  // TODO check for revocation
  const [realm, token] = jwtToken.split(' ');
  if (realm !== 'Bearer') {
    throw new BadRequestError('Authorisation must be a bearer token');
  }

  if (!token) {
    throw new BadRequestError(
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

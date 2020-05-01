import { NextFunction, Request, Response } from 'express';
import { Repository } from 'mongoize-orm';
import { User } from '../../models/user.model';

import { auth } from 'firebase-admin';
import DecodedIdToken = auth.DecodedIdToken;
import {
  Provider,
  SocialProviderHeader,
  SocialRequest
} from './authenticated.request';
import { BadRequestError } from '../errors/bad-request.error';
import { UnauthorisedError } from '../errors/unauthorised.error';

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

export const withFirebaseUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const firebaseId = req.headers['x-firebase-id'];
  const jwtToken = req.headers['authorization'];
  const firebaseProvider = req.headers['x-firebase-provider'] as Provider;

  if (!jwtToken || !firebaseId || !firebaseProvider) {
    throw new BadRequestError('Id and token headers are required headers');
  }

  if (
    Array.isArray(firebaseId) ||
    Array.isArray(jwtToken) ||
    Array.isArray(firebaseProvider)
  ) {
    throw new BadRequestError('Id and token headers are not arrays');
  }

  const [authorisation, token] = jwtToken.split(' ');
  if (authorisation !== 'Bearer') {
    throw new BadRequestError('Bearer authorization required');
  }

  // TODO check for revocation
  const decodedIdToken: DecodedIdToken = await auth().verifyIdToken(
    decode(token),
    true
  );

  if (decodedIdToken.uid !== firebaseId) {
    throw new UnauthorisedError(
      "The associated Firebase id doesn't match the one on record"
    );
  }

  const headers: SocialProviderHeader = {
    provider: {
      providerId: firebaseId
    }
  };

  Object.assign(req, { ...headers });

  next();
};

const encode = (data: string): string => {
  return Buffer.from(data).toString('base64');
};

const decode = (data: string): string => {
  return Buffer.from(data, 'base64').toString('ascii');
};

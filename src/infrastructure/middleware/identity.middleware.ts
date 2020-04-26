import { NextFunction, Request, Response } from 'express';
import { Repository } from 'mongoize-orm';
import { User } from '../../models/user.model';

import { auth } from 'firebase-admin';
import DecodedIdToken = auth.DecodedIdToken;
import { Provider, SocialProviderHeader } from './authenticated.request';

export const withUser = async (
  req: Request & SocialProviderHeader,
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
  const firebaseToken = req.headers['x-firebase-token'];
  const firebaseProvider = req.headers['x-firebase-provider'] as Provider;

  if (!firebaseId || !firebaseToken || !firebaseProvider) {
    res
      .status(400)
      .json({ error: 'id and token headers are required headers' });
    return;
  }

  if (
    Array.isArray(firebaseId) ||
    Array.isArray(firebaseToken) ||
    Array.isArray(firebaseProvider)
  ) {
    res.status(400).json({ error: 'id and token headers are not arrays' });
    return;
  }

  const decodedIdToken: DecodedIdToken = await auth().verifyIdToken(
    firebaseToken,
    false
  );
  if (decodedIdToken.uid !== firebaseId) {
    res.status(403).json({ error: '' });
    return;
  }

  const headers: SocialProviderHeader = {
    provider: {
      providerId: firebaseId,
      providerToken: firebaseToken,
      providerOrigin: firebaseProvider
    }
  };

  Object.assign(req, { ...headers });

  next();
};

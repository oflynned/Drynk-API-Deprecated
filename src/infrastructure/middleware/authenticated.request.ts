import { Request } from 'express';
import { User } from '../../models/user.model';
import { Session } from '../../models/session.model';

export type UserHeader = { user: User };

export type SocialProviderHeader = {
  provider: {
    providerId: string;
  };
};

export type SocialRequest = Request & SocialProviderHeader;

export type AuthenticatedRequest = Request & UserHeader & SocialProviderHeader;

export type SessionRequest = AuthenticatedRequest & { session?: Session };

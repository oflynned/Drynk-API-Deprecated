import { Request } from 'express';
import { User } from '../../models/user.model';

export type UserHeader = { user: User };

export type SocialProviderHeader = {
  provider: {
    providerId: string;
  };
};

export type SocialRequest = Request & SocialProviderHeader;

export type AuthenticatedRequest = Request & UserHeader & SocialProviderHeader;

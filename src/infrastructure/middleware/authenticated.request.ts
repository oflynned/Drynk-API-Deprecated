import { Request } from 'express';
import { User } from '../../models/user.model';

export type UserHeader = { user: User };

export type Provider = 'google' | 'facebook' | 'twitter' | undefined;

export type SocialProviderHeader = {
  provider: {
    providerId: string;
    providerToken: string;
    providerOrigin: Provider;
  };
};

export type SocialRequest = Request & SocialProviderHeader;

export type AuthenticatedRequest = Request & UserHeader & SocialProviderHeader;

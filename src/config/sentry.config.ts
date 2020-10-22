import { NodeOptions } from '@sentry/node';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import { Application } from 'express';

export const sentryConfig = (app: Application): NodeOptions => {
  return {
    dsn: process.env.SENTRY_DSN,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Tracing.Integrations.Express({ app })
    ],
    tracesSampleRate: 1.0
  };
};

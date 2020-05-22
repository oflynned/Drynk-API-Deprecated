export type SentryOptions = {
  dsn: string;
};

export const sentryConfig = (): SentryOptions => {
  return {
    dsn: process.env.SENTRY_DSN
  };
};

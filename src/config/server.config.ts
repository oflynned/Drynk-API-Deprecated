export const serverConfig = {
  sessionSecret: process.env.SESSION_SECRET || 'session_secret',
  serverPort: parseInt(process.env.PORT, 10) || 3001
};

export default serverConfig;

export type ServerType = {
  port: number;
};

export const serverConfig = (): ServerType => {
  return {
    port: parseInt(process.env.PORT, 10) || 3001
  };
};

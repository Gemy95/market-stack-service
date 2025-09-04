const DEFAULT_SERVER_PORT = 5000;

export interface Configuration {
  app: AppSetting;
}

export interface AppSetting {
  env: string;
  port: number;
}

export const configuration = (): Configuration => {
  const defaultConfiguration: Configuration = {
    app: {
      env: process.env.NODE_ENV,
      port: parseInt(process.env.SERVER_PORT, 10) || DEFAULT_SERVER_PORT,
    },
  };
  return defaultConfiguration;
};

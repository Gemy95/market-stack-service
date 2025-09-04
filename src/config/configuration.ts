const DEFAULT_SERVER_PORT = 5000;

export interface Configuration {
  app: AppSetting;
  services: Services;
}

export interface AppSetting {
  env: string;
  port: number;
}

export interface Services {
  marketStack: MarketStack;
}

export interface MarketStack {
  url: string;
  apiKey: string;
}

export const configuration = (): Configuration => {
  const defaultConfiguration: Configuration = {
    app: {
      env: process.env.NODE_ENV,
      port: parseInt(process.env.SERVER_PORT, 10) || DEFAULT_SERVER_PORT,
    },
    services: {
      marketStack: {
        url: process.env.MARKET_STACK_BASE_URL,
        apiKey: process.env.MARKET_STACK_API_KEY,
      },
    },
  };
  return defaultConfiguration;
};

export type HealthInfo = {
  updated_at: string;
  depedencies: {
    database: {
      version: string;
      max_connections: number;
      open_connections: number;
    };
  };
};

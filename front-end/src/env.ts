type AppEnvironment = "development" | "staging" | "production";

function requireEnv(key: string): string {
  const value = import.meta.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value as string;
}

export const env = {
  appEnvironment: requireEnv("VITE_APP_ENV") as AppEnvironment,
  apiUrl: requireEnv("VITE_API_URL"),
};

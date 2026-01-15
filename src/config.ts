import 'dotenv/config';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  fogoscanApiUrl: requireEnv('FOGOSCAN_API_URL'),
  publicRpcUrl: requireEnv('PUBLIC_RPC_URL'),
  port: parseInt(requireEnv('PORT'), 10),
};

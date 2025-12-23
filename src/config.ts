import 'dotenv/config';

function required(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`missing env: ${name}`);
  return val;
}

export const config = {
  fogoscanApiUrl: required('FOGOSCAN_API_URL'),
  port: parseInt(required('PORT'), 10),
};

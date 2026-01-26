import { config } from '../config.js';

export interface RawProxyResponse {
  raw: true;
  body: string;
}

export async function proxyRequest(body: string): Promise<RawProxyResponse> {
  const response = await fetch(config.publicRpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  return { raw: true, body: await response.text() };
}

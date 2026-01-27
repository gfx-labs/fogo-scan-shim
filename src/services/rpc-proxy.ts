import JSONBig from 'json-bigint';
import { config } from '../config.js';
import type { JsonRpcRequest, JsonRpcResponse } from '../types.js';

const jsonBig = JSONBig({ useNativeBigInt: true, alwaysParseAsBig: true });

export async function proxyRequest(request: JsonRpcRequest): Promise<JsonRpcResponse> {
  const response = await fetch(config.publicRpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  const text = await response.text();
  const parsed = jsonBig.parse(text);

  return {
    jsonrpc: '2.0',
    id: request.id,
    result: parsed.result,
    error: parsed.error,
  };
}

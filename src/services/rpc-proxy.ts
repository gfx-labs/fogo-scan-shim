import { config } from '../config.js';
import { RpcErrorCode } from '../constants.js';
import type { JsonRpcRequest, JsonRpcResponse } from '../types.js';
import { rpcError } from '../types.js';

export async function proxyRequest(request: JsonRpcRequest): Promise<JsonRpcResponse> {
  try {
    const response = await fetch(config.publicRpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    return await response.json() as JsonRpcResponse;
  } catch (error) {
    console.error('RPC proxy error:', error);
    return rpcError(request.id, RpcErrorCode.INTERNAL_ERROR, 'Internal error proxying to RPC');
  }
}

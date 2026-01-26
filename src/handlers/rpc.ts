import type { JsonRpcRequest, JsonRpcResponse } from '../types.js';
import { rpcResult, rpcError } from '../types.js';
import { RpcErrorCode } from '../constants.js';
import { getTransaction, getBlockDetail } from '../services/fogoscan.js';
import { transformTransaction } from '../transformers/transaction.js';
import { transformBlock } from '../transformers/block.js';
import { proxyRequest, type RawProxyResponse } from '../services/rpc-proxy.js';

function elapsedMs(start: number): number {
  return Date.now() - start;
}

function truncateSignature(sig: string): string {
  return `${sig.slice(0, 12)}...`;
}

export async function handleRpcRequest(request: JsonRpcRequest, rawBody: string): Promise<JsonRpcResponse | RawProxyResponse> {
  const { method, params, id } = request;
  const start = Date.now();

  switch (method) {
    case 'getTransaction': {
      const signature = params?.[0] as string;
      if (!signature) {
        return rpcError(id, RpcErrorCode.INVALID_PARAMS, 'missing signature');
      }

      const result = await getTransaction(signature);
      const ms = elapsedMs(start);
      const sigShort = truncateSignature(signature);

      if (result) {
        console.log(`getTransaction ${sigShort} slot=${result.data.block_id} ${ms}ms`);
        return rpcResult(id, transformTransaction(result));
      }

      console.log(`getTransaction ${sigShort} not found ${ms}ms`);
      return rpcResult(id, null);
    }

    case 'getBlock': {
      const slot = params?.[0] as number;
      if (slot === undefined) {
        return rpcError(id, RpcErrorCode.INVALID_PARAMS, 'missing slot');
      }

      const result = await getBlockDetail(slot);
      const ms = elapsedMs(start);

      if (result) {
        console.log(`getBlock ${slot} txs=${result.data.transactions.length} ${ms}ms`);
        return rpcResult(id, transformBlock(result));
      }

      console.log(`getBlock ${slot} not found ${ms}ms`);
      return rpcResult(id, null);
    }

    default: {
      console.log(`proxying method: ${method}`);
      return proxyRequest(rawBody);
    }
  }
}

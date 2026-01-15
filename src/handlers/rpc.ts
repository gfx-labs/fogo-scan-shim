import type { JsonRpcRequest, JsonRpcResponse } from '../types.js';
import { rpcResult, rpcError } from '../types.js';
import { RpcErrorCode } from '../constants.js';
import { getTransaction, getBlockTransactions } from '../services/fogoscan.js';
import { transformTransaction } from '../transformers/transaction.js';
import { proxyRequest } from '../services/rpc-proxy.js';

function elapsedMs(start: number): number {
  return Date.now() - start;
}

function truncateSignature(sig: string): string {
  return `${sig.slice(0, 12)}...`;
}

export async function handleRpcRequest(request: JsonRpcRequest): Promise<JsonRpcResponse> {
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

      const transactions = await getBlockTransactions(slot);
      const ms = elapsedMs(start);

      if (transactions) {
        console.log(`getBlock ${slot} txs=${transactions.length} ${ms}ms`);
        return rpcResult(id, {
          blockHeight: slot,
          transactions: transactions.map(transformTransaction),
        });
      }

      console.log(`getBlock ${slot} not found ${ms}ms`);
      return rpcResult(id, null);
    }

    default: {
      console.log(`proxying method: ${method}`);
      return proxyRequest(request);
    }
  }
}

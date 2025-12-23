import type { JsonRpcRequest, JsonRpcResponse } from '../types.js';
import { getTransaction, getBlockTransactions } from '../services/fogoscan.js';
import { transformTransaction } from '../transformers/transaction.js';

export async function handleRpcRequest(request: JsonRpcRequest): Promise<JsonRpcResponse> {
  const { method, params, id } = request;
  const start = Date.now();

  switch (method) {
    case 'getHealth':
      return { jsonrpc: '2.0', id, result: 'ok' };

    case 'getTransaction': {
      const sig = params?.[0] as string;
      if (!sig) {
        return { jsonrpc: '2.0', id, error: { code: -32602, message: 'missing signature' } };
      }

      const result = await getTransaction(sig);
      const ms = Date.now() - start;

      if (result) {
        console.log(`getTransaction ${sig.slice(0, 12)}... slot=${result.data.block_id} ${ms}ms`);
        return { jsonrpc: '2.0', id, result: transformTransaction(result) };
      }

      console.log(`getTransaction ${sig.slice(0, 12)}... not found ${ms}ms`);
      return { jsonrpc: '2.0', id, result: null };
    }

    case 'getBlock': {
      const slot = params?.[0] as number;
      if (slot === undefined) {
        return { jsonrpc: '2.0', id, error: { code: -32602, message: 'missing slot' } };
      }

      const txs = await getBlockTransactions(slot);
      const ms = Date.now() - start;

      if (txs) {
        console.log(`getBlock ${slot} txs=${txs.length} ${ms}ms`);
        return {
          jsonrpc: '2.0',
          id,
          result: { blockHeight: slot, transactions: txs.map(tx => transformTransaction(tx)) },
        };
      }

      console.log(`getBlock ${slot} not found ${ms}ms`);
      return { jsonrpc: '2.0', id, result: null };
    }

    default:
      console.log(`unsupported method: ${method}`);
      return { jsonrpc: '2.0', id, error: { code: -32601, message: `unsupported: ${method}` } };
  }
}

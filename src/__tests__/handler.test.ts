import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import type { FogoscanTransactionResponse, JsonRpcResponse } from '../types.js';

const mockGetTransaction = jest.fn<() => Promise<FogoscanTransactionResponse | null>>();
const mockGetBlockTransactions = jest.fn<() => Promise<FogoscanTransactionResponse[] | null>>();
const mockProxyRequest = jest.fn<(req: unknown) => Promise<JsonRpcResponse>>();

jest.unstable_mockModule('../services/fogoscan.js', () => ({
  getTransaction: mockGetTransaction,
  getBlockTransactions: mockGetBlockTransactions,
}));

jest.unstable_mockModule('../services/rpc-proxy.js', () => ({
  proxyRequest: mockProxyRequest,
}));

const { handleRpcRequest } = await import('../handlers/rpc.js');

describe('handleRpcRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getHealth', () => {
    it('proxies to public RPC', async () => {
      mockProxyRequest.mockResolvedValue({
        jsonrpc: '2.0',
        id: 1,
        result: 'ok',
      });

      const request = {
        jsonrpc: '2.0',
        id: 1,
        method: 'getHealth',
      };
      const result = await handleRpcRequest(request);

      expect(mockProxyRequest).toHaveBeenCalledWith(request);
      expect(result.result).toBe('ok');
    });
  });

  describe('getTransaction', () => {
    const mockTxResponse: FogoscanTransactionResponse = {
      success: true,
      data: {
        trans_id: '5gB15Z6S7ev7s1iv818RHrMY1uD54HHEukjBXtmusdmPHjTFzEFx3EUtJY9L9ijMHhqA5veGzttXvuhq6DUik31X',
        block_id: 161800848,
        trans_time: 1765738852,
        fee: 6431,
        logMessage: ['log1', 'log2'],
        sol_bal_change: [],
        account_keys: [],
        parsed_instructions: [],
        recentBlockhash: 'hash',
        status: 1,
      },
    };

    it('returns error when signature missing', async () => {
      const result = await handleRpcRequest({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTransaction',
        params: [],
      });

      expect(result.error?.code).toBe(-32602);
      expect(result.error?.message).toBe('missing signature');
    });

    it('returns transformed tx when found', async () => {
      mockGetTransaction.mockResolvedValue(mockTxResponse);

      const result = await handleRpcRequest({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTransaction',
        params: ['5gB15Z6S7ev7s1iv818RHrMY1uD54HHEukjBXtmusdmPHjTFzEFx3EUtJY9L9ijMHhqA5veGzttXvuhq6DUik31X'],
      });

      expect(result.result).toBeDefined();
      expect((result.result as any).slot).toBe(161800848);
      expect((result.result as any).meta.fee).toBe(6431);
    });

    it('returns null when tx not found', async () => {
      mockGetTransaction.mockResolvedValue(null);

      const result = await handleRpcRequest({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTransaction',
        params: ['notfound'],
      });

      expect(result.result).toBeNull();
    });
  });

  describe('getBlock', () => {
    it('returns error when slot missing', async () => {
      const result = await handleRpcRequest({
        jsonrpc: '2.0',
        id: 1,
        method: 'getBlock',
        params: [],
      });

      expect(result.error?.code).toBe(-32602);
    });

    it('returns null when block not found', async () => {
      mockGetBlockTransactions.mockResolvedValue(null);

      const result = await handleRpcRequest({
        jsonrpc: '2.0',
        id: 1,
        method: 'getBlock',
        params: [161800848],
      });

      expect(result.result).toBeNull();
    });

    it('returns block with transactions when found', async () => {
      const mockTx: FogoscanTransactionResponse = {
        success: true,
        data: {
          trans_id: 'tx1',
          block_id: 161800848,
          trans_time: 1765738852,
          fee: 1000,
          logMessage: [],
          sol_bal_change: [],
          account_keys: [],
          parsed_instructions: [],
          recentBlockhash: 'hash',
          status: 1,
        },
      };
      mockGetBlockTransactions.mockResolvedValue([mockTx]);

      const result = await handleRpcRequest({
        jsonrpc: '2.0',
        id: 1,
        method: 'getBlock',
        params: [161800848],
      });

      expect((result.result as any).blockHeight).toBe(161800848);
      expect((result.result as any).transactions).toHaveLength(1);
    });
  });

  describe('proxied methods', () => {
    it('proxies unknown methods to public RPC', async () => {
      mockProxyRequest.mockResolvedValue({
        jsonrpc: '2.0',
        id: 1,
        result: 123456789,
      });

      const request = {
        jsonrpc: '2.0',
        id: 1,
        method: 'getSlot',
      };
      const result = await handleRpcRequest(request);

      expect(mockProxyRequest).toHaveBeenCalledWith(request);
      expect(result.result).toBe(123456789);
    });
  });
});

import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { getTransaction, getBlockDetail } from '../services/fogoscan.js';

const mockFetch = jest.fn<typeof fetch>();
global.fetch = mockFetch;

function mockResponse(body: unknown, init: { ok: boolean; status?: number }): Response {
  return {
    ok: init.ok,
    status: init.status ?? 200,
    json: () => Promise.resolve(body),
  } as Response;
}

describe('fogoscan service', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('getTransaction', () => {
    it('returns data on success', async () => {
      const mockData = {
        success: true,
        data: {
          trans_id: 'abc123',
          block_id: 100,
          trans_time: 1234567890,
          fee: 5000,
          logMessage: [],
          sol_bal_change: [],
          account_keys: [],
          parsed_instructions: [],
          recentBlockhash: 'hash',
          status: 1,
        },
      };

      mockFetch.mockResolvedValue(mockResponse(mockData, { ok: true }));

      const result = await getTransaction('abc123');
      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/transaction/detail?tx=abc123')
      );
    });

    it('returns null on 404', async () => {
      mockFetch.mockResolvedValue(mockResponse({}, { ok: false, status: 404 }));

      const result = await getTransaction('notfound');
      expect(result).toBeNull();
    });

    it('returns null on non-404 error', async () => {
      mockFetch.mockResolvedValue(mockResponse({}, { ok: false, status: 500 }));

      const result = await getTransaction('error');
      expect(result).toBeNull();
    });

    it('returns null when success is false', async () => {
      mockFetch.mockResolvedValue(mockResponse({ success: false }, { ok: true }));

      const result = await getTransaction('failed');
      expect(result).toBeNull();
    });

    it('returns null on fetch error', async () => {
      mockFetch.mockRejectedValue(new Error('network error'));

      const result = await getTransaction('error');
      expect(result).toBeNull();
    });
  });

  describe('getBlockDetail', () => {
    it('returns data on success', async () => {
      const mockData = {
        success: true,
        data: { blockHeight: 12345, transactions: [] },
      };

      mockFetch.mockResolvedValue(mockResponse(mockData, { ok: true }));

      const result = await getBlockDetail(12345);
      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/block/detail?block=12345')
      );
    });

    it('returns null on 404', async () => {
      mockFetch.mockResolvedValue(mockResponse({}, { ok: false, status: 404 }));

      const result = await getBlockDetail(99999);
      expect(result).toBeNull();
    });

    it('returns null on fetch error', async () => {
      mockFetch.mockRejectedValue(new Error('network error'));

      const result = await getBlockDetail(12345);
      expect(result).toBeNull();
    });
  });
});

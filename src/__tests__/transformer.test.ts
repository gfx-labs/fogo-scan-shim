import { describe, it, expect } from '@jest/globals';
import { transformTransaction } from '../transformers/transaction.js';
import type { FogoscanTransactionResponse } from '../types.js';

describe('transformTransaction', () => {
  const mockFogoscanResponse: FogoscanTransactionResponse = {
    success: true,
    data: {
      trans_id: '5gB15Z6S7ev7s1iv818RHrMY1uD54HHEukjBXtmusdmPHjTFzEFx3EUtJY9L9ijMHhqA5veGzttXvuhq6DUik31X',
      block_id: 161800848,
      trans_time: 1765738852,
      fee: 6431,
      logMessage: [
        'Program worm2mrQkG1B1KTz37erMfWN8anHkSK24nzca7UD8BB invoke [1]',
        'Program log: Sequence: 100',
        'Program worm2mrQkG1B1KTz37erMfWN8anHkSK24nzca7UD8BB success',
      ],
      sol_bal_change: [
        { address: 'addr1', pre_balance: 1000000, post_balance: 900000, change_amount: -100000 },
        { address: 'addr2', pre_balance: 500000, post_balance: 600000, change_amount: 100000 },
      ],
      account_keys: ['addr1', 'addr2', 'programId'],
      parsed_instructions: [
        {
          index: 0,
          program_id: 'programId',
          accounts: ['addr1', 'addr2'],
          data: 'base64data',
        },
      ],
      recentBlockhash: 'GHtXQBsoZHVnNFa9YevAzFr17DJjgHXk3ycTKD5xD3Zi',
      status: 1,
    },
  };

  it('maps slot from block_id', () => {
    const result = transformTransaction(mockFogoscanResponse);
    expect(result.slot).toBe(161800848);
  });

  it('maps blockTime from trans_time', () => {
    const result = transformTransaction(mockFogoscanResponse);
    expect(result.blockTime).toBe(1765738852);
  });

  it('maps fee correctly', () => {
    const result = transformTransaction(mockFogoscanResponse);
    expect(result.meta.fee).toBe(6431);
  });

  it('maps logMessages', () => {
    const result = transformTransaction(mockFogoscanResponse);
    expect(result.meta.logMessages).toHaveLength(3);
    expect(result.meta.logMessages[1]).toBe('Program log: Sequence: 100');
  });

  it('maps preBalances from sol_bal_change', () => {
    const result = transformTransaction(mockFogoscanResponse);
    expect(result.meta.preBalances).toEqual([1000000, 500000]);
  });

  it('maps postBalances from sol_bal_change', () => {
    const result = transformTransaction(mockFogoscanResponse);
    expect(result.meta.postBalances).toEqual([900000, 600000]);
  });

  it('sets err to null for successful tx (status=1)', () => {
    const result = transformTransaction(mockFogoscanResponse);
    expect(result.meta.err).toBeNull();
  });

  it('sets err for failed tx (status!=1)', () => {
    const failed = { ...mockFogoscanResponse, data: { ...mockFogoscanResponse.data, status: 0 } };
    const result = transformTransaction(failed);
    expect(result.meta.err).toEqual({ error: 'failed' });
  });

  it('maps accountKeys', () => {
    const result = transformTransaction(mockFogoscanResponse);
    expect(result.transaction.message.accountKeys).toEqual(['addr1', 'addr2', 'programId']);
  });

  it('maps recentBlockhash', () => {
    const result = transformTransaction(mockFogoscanResponse);
    expect(result.transaction.message.recentBlockhash).toBe('GHtXQBsoZHVnNFa9YevAzFr17DJjgHXk3ycTKD5xD3Zi');
  });

  it('uses trans_id as signature when signatures not provided', () => {
    const result = transformTransaction(mockFogoscanResponse);
    expect(result.transaction.signatures).toEqual([mockFogoscanResponse.data.trans_id]);
  });

  it('maps instructions with programIdIndex', () => {
    const result = transformTransaction(mockFogoscanResponse);
    const inst = result.transaction.message.instructions[0] as { programIdIndex: number };
    expect(inst.programIdIndex).toBe(2);
  });

  it('handles missing sol_bal_change', () => {
    const noBalances = {
      ...mockFogoscanResponse,
      data: { ...mockFogoscanResponse.data, sol_bal_change: undefined as any },
    };
    const result = transformTransaction(noBalances);
    expect(result.meta.preBalances).toEqual([]);
    expect(result.meta.postBalances).toEqual([]);
  });

  it('handles missing logMessage', () => {
    const noLogs = {
      ...mockFogoscanResponse,
      data: { ...mockFogoscanResponse.data, logMessage: undefined as any },
    };
    const result = transformTransaction(noLogs);
    expect(result.meta.logMessages).toEqual([]);
  });
});

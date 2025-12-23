import type { FogoscanTransactionResponse, SolanaTransactionResult } from '../types.js';

export function transformTransaction(fogoscan: FogoscanTransactionResponse): SolanaTransactionResult {
  const { data } = fogoscan;

  const preBalances: number[] = [];
  const postBalances: number[] = [];

  for (const bal of data.sol_bal_change || []) {
    preBalances.push(bal.pre_balance ?? 0);
    postBalances.push(bal.post_balance ?? 0);
  }

  const instructions = (data.parsed_instructions || []).map((inst) => ({
    programIdIndex: data.account_keys?.indexOf(inst.program_id) ?? 0,
    accounts: inst.accounts?.map((acc) => data.account_keys?.indexOf(acc) ?? 0) ?? [],
    data: inst.data || '',
  }));

  return {
    slot: data.block_id,
    blockTime: data.trans_time || null,
    meta: {
      err: data.status === 1 ? null : { error: 'failed' },
      fee: data.fee,
      logMessages: data.logMessage || [],
      preBalances,
      postBalances,
      innerInstructions: [],
      preTokenBalances: [],
      postTokenBalances: [],
    },
    transaction: {
      message: {
        accountKeys: data.account_keys || [],
        recentBlockhash: data.recentBlockhash || '',
        instructions,
      },
      signatures: data.signatures || [data.trans_id],
    },
  };
}

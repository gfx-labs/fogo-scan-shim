import type { FogoscanTransactionResponse, SolanaTransactionResult, SolanaInstruction, FogoscanAccountKey } from '../types.js';
import { FogoscanStatus, SolanaDefaults } from '../constants.js';

function extractBalances(balanceChanges: { pre_balance?: number; post_balance?: number }[]): {
  preBalances: number[];
  postBalances: number[];
} {
  const preBalances: number[] = [];
  const postBalances: number[] = [];

  for (const bal of balanceChanges) {
    preBalances.push(bal.pre_balance ?? 0);
    postBalances.push(bal.post_balance ?? 0);
  }

  return { preBalances, postBalances };
}

function buildMessageHeader(accountKeys: FogoscanAccountKey[]) {
  const signers = accountKeys.filter((k) => k.signer);
  const readonlySigners = signers.filter((k) => !k.writable);
  const readonlyUnsigned = accountKeys.filter((k) => !k.signer && !k.writable);

  return {
    numRequiredSignatures: signers.length,
    numReadonlySignedAccounts: readonlySigners.length,
    numReadonlyUnsignedAccounts: readonlyUnsigned.length,
  };
}

export function transformTransaction(fogoscan: FogoscanTransactionResponse): SolanaTransactionResult {
  const { data } = fogoscan;
  const isSuccess = data.status === FogoscanStatus.SUCCESS;

  const accountKeys = data.account_keys || [];
  const pubkeyList = accountKeys.map((k) => k.pubkey);
  const { preBalances, postBalances } = extractBalances(data.sol_bal_change || []);

  const instructions: SolanaInstruction[] = (data.parsed_instructions || []).map((inst) => ({
    programIdIndex: pubkeyList.indexOf(inst.program_id),
    accounts: inst.accounts?.map((acc) => pubkeyList.indexOf(acc)) ?? [],
    data: inst.data_raw || '',
    stackHeight: SolanaDefaults.STACK_HEIGHT,
  }));

  const signatures = data.signatures || [data.trans_id];

  return {
    slot: data.block_id,
    blockTime: data.trans_time || null,
    meta: {
      err: isSuccess ? null : { error: 'failed' },
      fee: data.fee,
      logMessages: data.logMessage || [],
      preBalances,
      postBalances,
      innerInstructions: [],
      preTokenBalances: [],
      postTokenBalances: [],
      computeUnitsConsumed: data.compute_units_consumed ?? 0,
      loadedAddresses: { readonly: [], writable: [] },
      rewards: [],
      status: isSuccess ? { Ok: null } : { Err: { error: 'failed' } },
    },
    transaction: {
      message: {
        accountKeys: pubkeyList,
        recentBlockhash: data.recentBlockhash || '',
        instructions,
        header: buildMessageHeader(accountKeys),
        addressTableLookups: data.addressTableLookups || [],
      },
      signatures,
    },
    version: data.version ?? SolanaDefaults.VERSION,
  };
}

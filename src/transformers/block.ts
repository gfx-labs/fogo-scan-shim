import type {
  FogoscanBlockDetailResponse,
  FogoscanBlockTransaction,
  SolanaBlockResult,
  SolanaTransactionMeta,
  SolanaTransaction,
} from '../types.js';
import { buildMessageHeader } from './transaction.js';

function transformBlockTransaction(tx: FogoscanBlockTransaction): {
  meta: SolanaTransactionMeta;
  transaction: SolanaTransaction;
  version: number | string;
} {
  const accountKeys = tx.transaction.message.accountKeys;
  const pubkeyList = accountKeys.map((k) => k.pubkey);

  const instructions = tx.transaction.message.instructions.map((inst) => ({
    programIdIndex: pubkeyList.indexOf(inst.programId),
    accounts: inst.accounts,
    data: inst.data,
    stackHeight: inst.stackHeight,
  }));

  return {
    meta: {
      err: tx.meta.err,
      fee: tx.meta.fee,
      logMessages: tx.meta.logMessages,
      preBalances: tx.meta.preBalances,
      postBalances: tx.meta.postBalances,
      innerInstructions: tx.meta.innerInstructions,
      preTokenBalances: tx.meta.preTokenBalances,
      postTokenBalances: tx.meta.postTokenBalances,
      computeUnitsConsumed: tx.meta.computeUnitsConsumed,
      loadedAddresses: { readonly: [], writable: [] },
      rewards: tx.meta.rewards ?? [],
      status: tx.meta.status,
    },
    transaction: {
      message: {
        accountKeys: pubkeyList,
        recentBlockhash: tx.transaction.message.recentBlockhash,
        instructions,
        header: tx.transaction.message.header ?? buildMessageHeader(accountKeys),
        addressTableLookups: [],
      },
      signatures: tx.transaction.signatures,
    },
    version: tx.version,
  };
}

export function transformBlock(fogoscan: FogoscanBlockDetailResponse): SolanaBlockResult {
  const { data } = fogoscan;

  return {
    blockHeight: data.blockHeight,
    blockTime: data.blockTime,
    blockhash: data.blockhash,
    parentSlot: data.parentSlot,
    previousBlockhash: data.previousBlockhash,
    transactions: data.transactions.map(transformBlockTransaction),
  };
}

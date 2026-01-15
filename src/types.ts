import { JSON_RPC_VERSION } from './constants.js';

export interface JsonRpcRequest {
  jsonrpc: string;
  id: number | string;
  method: string;
  params?: unknown[];
}

export interface JsonRpcError {
  code: number;
  message: string;
  data?: unknown;
}

export interface JsonRpcResponse<T = unknown> {
  jsonrpc: string;
  id: number | string;
  result?: T;
  error?: JsonRpcError;
}

export type RequestId = number | string | null;

export function rpcResult<T>(id: RequestId, result: T): JsonRpcResponse<T> {
  return { jsonrpc: JSON_RPC_VERSION, id: id ?? 0, result };
}

export function rpcError(id: RequestId, code: number, message: string): JsonRpcResponse {
  return { jsonrpc: JSON_RPC_VERSION, id: id ?? 0, error: { code, message } };
}

export interface FogoscanBalanceChange {
  address: string;
  pre_balance: number;
  post_balance: number;
  change_amount: number;
}

export interface FogoscanInstruction {
  ins_index: number;
  program_id: string;
  program?: string;
  type?: string;
  parsed_type?: string;
  accounts?: string[];
  data_raw?: string;
}

export interface FogoscanAccountKey {
  pubkey: string;
  writable: boolean;
  signer: boolean;
  source: string;
}

export interface FogoscanTransactionData {
  trans_id: string;
  block_id: number;
  trans_time: number;
  fee: number;
  logMessage: string[];
  sol_bal_change: FogoscanBalanceChange[];
  account_keys: FogoscanAccountKey[];
  parsed_instructions: FogoscanInstruction[];
  recentBlockhash: string;
  status: number;
  signatures?: string[];
  compute_units_consumed?: number;
  version?: number;
  addressTableLookups?: unknown[];
  list_signer?: string[];
}

export interface FogoscanTransactionResponse {
  success: boolean;
  data: FogoscanTransactionData;
}

export interface SolanaTransactionMeta {
  err: null | unknown;
  fee: number;
  logMessages: string[];
  preBalances: number[];
  postBalances: number[];
  innerInstructions: unknown[];
  preTokenBalances: unknown[];
  postTokenBalances: unknown[];
  computeUnitsConsumed: number;
  loadedAddresses: {
    readonly: string[];
    writable: string[];
  };
  rewards: unknown[];
  status: { Ok: null } | { Err: unknown };
}

export interface SolanaMessageHeader {
  numRequiredSignatures: number;
  numReadonlySignedAccounts: number;
  numReadonlyUnsignedAccounts: number;
}

export interface SolanaInstruction {
  programIdIndex: number;
  accounts: number[];
  data: string;
  stackHeight: number;
}

export interface SolanaTransactionMessage {
  accountKeys: string[];
  recentBlockhash: string;
  instructions: SolanaInstruction[];
  header: SolanaMessageHeader;
  addressTableLookups: unknown[];
}

export interface SolanaTransaction {
  message: SolanaTransactionMessage;
  signatures: string[];
}

export interface SolanaTransactionResult {
  slot: number;
  blockTime: number | null;
  meta: SolanaTransactionMeta;
  transaction: SolanaTransaction;
  version: number;
}

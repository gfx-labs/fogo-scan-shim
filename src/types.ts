export interface JsonRpcRequest {
  jsonrpc: string;
  id: number | string;
  method: string;
  params?: unknown[];
}

export interface JsonRpcResponse<T = unknown> {
  jsonrpc: string;
  id: number | string;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export interface FogoscanBalanceChange {
  address: string;
  pre_balance: number;
  post_balance: number;
  change_amount: number;
}

export interface FogoscanInstruction {
  index: number;
  program_id: string;
  program_name?: string;
  parsed?: unknown;
  accounts?: string[];
  data?: string;
  inner_instructions?: FogoscanInstruction[];
}

export interface FogoscanTransactionData {
  trans_id: string;
  block_id: number;
  trans_time: number;
  fee: number;
  logMessage: string[];
  sol_bal_change: FogoscanBalanceChange[];
  account_keys: string[];
  parsed_instructions: FogoscanInstruction[];
  recentBlockhash: string;
  status: number;
  signatures?: string[];
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
  innerInstructions?: unknown[];
  preTokenBalances?: unknown[];
  postTokenBalances?: unknown[];
}

export interface SolanaTransactionMessage {
  accountKeys: string[];
  recentBlockhash: string;
  instructions: unknown[];
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
}

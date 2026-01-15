export const JSON_RPC_VERSION = '2.0' as const;

export const RpcErrorCode = {
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
} as const;

export const HttpStatus = {
  NOT_FOUND: 404,
} as const;

export const FogoscanStatus = {
  SUCCESS: 1,
} as const;

export const SolanaDefaults = {
  STACK_HEIGHT: 1,
  VERSION: 0,
} as const;

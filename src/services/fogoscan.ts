import { config } from '../config.js';
import type { FogoscanTransactionResponse } from '../types.js';

async function fetchApi<T>(path: string, label: string): Promise<T | null> {
  const url = `${config.fogoscanApiUrl}${path}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status !== 404) console.error(`fogoscan ${res.status} ${label}`);
      return null;
    }
    const data = await res.json();
    if (!data.success || !data.data) return null;
    return data;
  } catch (err) {
    console.error(`fogoscan error ${label}`, err);
    return null;
  }
}

export async function getTransaction(sig: string): Promise<FogoscanTransactionResponse | null> {
  return fetchApi(`/v1/transaction/detail?tx=${sig}`, `tx=${sig.slice(0, 12)}...`);
}

export async function getBlockTransactions(slot: number): Promise<FogoscanTransactionResponse[] | null> {
  const result = await fetchApi<{ data: FogoscanTransactionResponse[] }>(`/v1/block/transactions?block=${slot}`, `block=${slot}`);
  return result?.data ?? null;
}

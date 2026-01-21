import { config } from '../config.js';
import { HttpStatus } from '../constants.js';
import type { FogoscanTransactionResponse, FogoscanBlockDetailResponse } from '../types.js';

async function fetchFromFogoscan<T>(path: string, label: string): Promise<T | null> {
  const url = `${config.fogoscanApiUrl}${path}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status !== HttpStatus.NOT_FOUND) {
        console.error(`fogoscan ${response.status} ${label}`);
      }
      return null;
    }

    const data = await response.json();
    if (!data.success || !data.data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error(`fogoscan error ${label}`, error);
    return null;
  }
}

export async function getTransaction(sig: string): Promise<FogoscanTransactionResponse | null> {
  return fetchFromFogoscan(`/v1/transaction/detail?tx=${sig}`, `tx=${sig.slice(0, 12)}...`);
}

export async function getBlockDetail(slot: number): Promise<FogoscanBlockDetailResponse | null> {
  return fetchFromFogoscan(`/v1/block/detail?block=${slot}`, `block=${slot}`);
}

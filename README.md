# fogo-scan-shim

JSON-RPC proxy that serves historical Fogo transaction data from Fogoscan's API.

## Problem

Fogo doesn't have an archival node at the time of creation. RPC nodes prune historical transaction data after a few days, returning errors when querying old transactions:

```json
{"jsonrpc":"2.0","id":1,"error":{"code":-32601,"message":"internal error"}}
```

## Solution

Fogoscan indexes all Fogo transactions. This shim provides an SVM-compatible JSON-RPC interface that fetches historical data from Fogoscan's API. All other RPC methods are proxied to a configurable public RPC endpoint, making this a drop-in replacement for direct RPC access.

```
                                              ┌─────────────────┐
                                         ┌───▶│  Fogoscan API   │
                                         │    │  (historical)   │
┌─────────────────┐     ┌─────────────────┐    └─────────────────┘
│                 │     │                 │
│  Your App       │────▶│  fogo-scan-shim │
│                 │◀────│                 │
│                 │     │                 │    ┌─────────────────┐
└─────────────────┘     └─────────────────┘    │  Public RPC     │
                                         └───▶│  (passthrough)  │
                                              └─────────────────┘
```

## RPC Methods

### Handled by Fogoscan

| Method | Description |
|--------|-------------|
| `getTransaction` | Fetch transaction by signature |
| `getBlock` | Fetch block transactions by slot |

### Proxied to Public RPC

All other methods (including `getHealth`, `getSlot`, `getBlockHeight`, etc.) are proxied to the configured public RPC URL.

### getTransaction

```bash
curl -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getTransaction","params":["5gB15Z6S7ev7s1iv818RHrMY1uD54HHEukjBXtmusdmPHjTFzEFx3EUtJY9L9ijMHhqA5veGzttXvuhq6DUik31X"]}'
```

### getBlock

```bash
curl -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getBlock","params":[161800848]}'
```

### Other Methods (Proxied)

```bash
# getHealth, getSlot, etc. are proxied to public RPC
curl -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getSlot"}'
```

## Setup

### Prerequisites

- Node.js 24+ (LTS)
- pnpm

### Install

```bash
pnpm install
```

### Configure

```bash
cp .env.example .env
```

Required environment variables:

| Variable | Description |
|----------|-------------|
| `FOGOSCAN_API_URL` | Fogoscan API base URL |
| `PUBLIC_RPC_URL` | Public RPC URL for proxying non-handled methods |
| `PORT` | Port to listen on |

## Run Locally

```bash
# Development (hot reload)
pnpm dev

# Production
pnpm start
```

## Run with Docker

```bash
# Build
docker build -t fogo-scan-shim .

# Run
docker run -d -p 8899:8899 \
  -e FOGOSCAN_API_URL=https://api.fogoscan.com \
  -e PUBLIC_RPC_URL=https://rpc.fogo.io \
  -e PORT=8899 \
  fogo-scan-shim
```

Or with an env file:

```bash
docker run -d -p 8899:8899 --env-file .env fogo-scan-shim
```

## Test

```bash
pnpm test
```

# fogo-scan-shim

JSON-RPC proxy that serves historical Fogo transaction data from Fogoscan's API.

## Problem

Fogo doesn't have an archival node at the time of creation. RPC nodes prune historical transaction data after a few days, returning errors when querying old transactions:

```json
{"jsonrpc":"2.0","id":1,"error":{"code":-32601,"message":"internal error"}}
```

## Solution

Fogoscan indexes all Fogo transactions. This shim provides a Solana-compatible JSON-RPC interface that fetches historical data from Fogoscan's API.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Your App       │────▶│  fogo-scan-shim │────▶│  Fogoscan API   │
│                 │◀────│                 │◀────│                 │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Supported RPC Methods

| Method | Description |
|--------|-------------|
| `getTransaction` | Fetch transaction by signature |
| `getBlock` | Fetch block transactions by slot |
| `getHealth` | Returns `"ok"` |

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

### getHealth

```bash
curl -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
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

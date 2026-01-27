import Fastify from 'fastify';
import cors from '@fastify/cors';
import JSONBig from 'json-bigint';
import { config } from './config.js';
import { RpcErrorCode } from './constants.js';
import { handleRpcRequest } from './handlers/rpc.js';
import type { JsonRpcRequest } from './types.js';
import { rpcError } from './types.js';

const jsonBig = JSONBig({ useNativeBigInt: true, alwaysParseAsBig: true });

const fastify = Fastify({ logger: false });

await fastify.register(cors);

fastify.get('/health', async () => ({ status: 'ok' }));

fastify.post('/', async (request, reply) => {
  const body = request.body as JsonRpcRequest;

  if (!body?.method) {
    return reply.status(400).send(rpcError(null, RpcErrorCode.INVALID_REQUEST, 'Invalid Request'));
  }

  const result = await handleRpcRequest(body);

  return reply.type('application/json').send(jsonBig.stringify(result));
});

await fastify.listen({ port: config.port, host: '0.0.0.0' });
console.log(`listening on :${config.port}`);

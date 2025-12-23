import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config.js';
import { handleRpcRequest } from './handlers/rpc.js';
import type { JsonRpcRequest } from './types.js';

const fastify = Fastify({ logger: false });

await fastify.register(cors);

fastify.get('/health', async () => ({ status: 'ok' }));

fastify.post('/', async (request, reply) => {
  const body = request.body as JsonRpcRequest;

  if (!body || !body.method) {
    return reply.status(400).send({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32600, message: 'Invalid Request' },
    });
  }

  return handleRpcRequest(body);
});

await fastify.listen({ port: config.port, host: '0.0.0.0' });
console.log(`listening on :${config.port}`);

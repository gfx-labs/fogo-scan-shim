import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config.js';
import { RpcErrorCode } from './constants.js';
import { handleRpcRequest } from './handlers/rpc.js';
import type { JsonRpcRequest } from './types.js';
import { rpcError } from './types.js';

const fastify = Fastify({ logger: false });

await fastify.register(cors);

fastify.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
  try {
    const json = JSON.parse(body as string);
    json._rawBody = body;
    done(null, json);
  } catch (err) {
    done(err as Error, undefined);
  }
});

fastify.get('/health', async () => ({ status: 'ok' }));

fastify.post('/', async (request, reply) => {
  const body = request.body as JsonRpcRequest & { _rawBody?: string };
  const rawBody = body?._rawBody ?? JSON.stringify(body);

  if (!body?.method) {
    return reply.status(400).send(rpcError(null, RpcErrorCode.INVALID_REQUEST, 'Invalid Request'));
  }

  const result = await handleRpcRequest(body, rawBody);

  if ('raw' in result) {
    return reply.type('application/json').send(result.body);
  }

  return result;
});

await fastify.listen({ port: config.port, host: '0.0.0.0' });
console.log(`listening on :${config.port}`);

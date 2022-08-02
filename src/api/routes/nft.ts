import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
import { FastifyPluginCallback } from 'fastify';
import { Server } from 'http';
import { SmartContractPrincipal, Metadata, TokenNotFoundResponse } from '../types';
import { handleTokenCache } from '../util/cache';
import { parseMetadataLocaleBundle } from '../util/helpers';

export const NftRoutes: FastifyPluginCallback<
  Record<never, never>,
  Server,
  TypeBoxTypeProvider
> = (fastify, options, done) => {
  fastify.addHook('preHandler', handleTokenCache);
  fastify.get('/nft/:principal/:token_id', {
    schema: {
      tags: ['Tokens'],
      params: Type.Object({
        principal: SmartContractPrincipal,
        token_id: Type.Integer(),
      }),
      response: {
        200: Type.Object({
          token_uri: Type.Optional(Type.String({ format: 'uri' })),
          metadata: Type.Optional(Metadata),
        }),
        404: TokenNotFoundResponse
      },
    }
  }, async (request, reply) => {
    const metadataBundle = await fastify.db.getNftMetadataBundle({
      contractPrincipal: request.params.principal,
      tokenNumber: request.params.token_id
    });
    if (!metadataBundle) {
      reply.code(404).send({ error: 'Token not found' });
      return;
    }
    reply.send({
      token_uri: metadataBundle?.token?.uri ?? undefined,
      metadata: parseMetadataLocaleBundle(metadataBundle?.metadataLocale)
    });
  });
  done();
}

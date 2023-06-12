import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync, FastifyPluginCallback } from 'fastify';
import { Server } from 'http';
import {
  FtMetadataResponse,
  FtPrincipalParam,
  LimitParam,
  OffsetParam,
  PaginatedResponse,
  StacksAddressParam,
  TokenQuerystringParams,
} from '../schemas';
import { handleTokenCache } from '../util/cache';
import { generateTokenErrorResponse, TokenErrorResponseSchema } from '../util/errors';
import { parseMetadataLocaleBundle } from '../util/helpers';

const IndexRoutes: FastifyPluginCallback<Record<never, never>, Server, TypeBoxTypeProvider> = (
  fastify,
  options,
  done
) => {
  fastify.get(
    '/ft',
    {
      schema: {
        operationId: 'getFungibleTokens',
        summary: 'Fungible Tokens',
        description: 'Retrieves a list of Fungible Tokens',
        tags: ['Tokens'],
        querystring: Type.Object({
          name: Type.Optional(Type.String()),
          symbol: Type.Optional(Type.String()),
          address: Type.Optional(StacksAddressParam),
          // Pagination
          offset: Type.Optional(OffsetParam),
          limit: Type.Optional(LimitParam),
        }),
        response: {
          200: PaginatedResponse(FtMetadataResponse, 'Paginated Ft Metadata Response'),
        },
      },
    },
    async (request, reply) => {
      const limit = request.query.limit ?? 20;
      const offset = request.query.offset ?? 0;
      const tokens = await fastify.db.getFungibleTokens({
        page: { limit, offset },
        filters: {
          name: request.query.name,
          symbol: request.query.symbol,
          address: request.query.address,
        },
      });
      await reply.send({
        limit,
        offset,
        total: tokens.total,
        results: tokens.results.map(t => ({
          name: t.name,
          symbol: t.symbol,
          decimals: t.decimals,
          total_supply: t.total_supply?.toString(),
          token_uri: t.uri,
          description: t.description,
          tx_id: t.tx_id,
          sender_address: t.principal?.split('.')[0],
          image_uri: t.cached_image,
          image_canonical_uri: t.image,
        })),
      });
    }
  );
  done();
};

const ShowRoutes: FastifyPluginCallback<Record<never, never>, Server, TypeBoxTypeProvider> = (
  fastify,
  options,
  done
) => {
  fastify.addHook('preHandler', handleTokenCache);
  fastify.get(
    '/ft/:principal',
    {
      schema: {
        operationId: 'getFtMetadata',
        summary: 'Fungible Token Metadata',
        description: 'Retrieves metadata for a SIP-010 Fungible Token',
        tags: ['Tokens'],
        params: Type.Object({
          principal: FtPrincipalParam,
        }),
        querystring: TokenQuerystringParams,
        response: {
          200: FtMetadataResponse,
          ...TokenErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const metadataBundle = await fastify.db.getTokenMetadataBundle({
          contractPrincipal: request.params.principal,
          tokenNumber: 1,
          locale: request.query.locale,
        });
        await reply.send({
          name: metadataBundle?.token?.name ?? undefined,
          symbol: metadataBundle?.token?.symbol ?? undefined,
          decimals: metadataBundle?.token?.decimals ?? undefined,
          total_supply: metadataBundle?.token?.total_supply?.toString() ?? undefined,
          token_uri: metadataBundle?.token?.uri ?? undefined,
          description: metadataBundle?.metadataLocale?.metadata?.description ?? undefined,
          tx_id: metadataBundle?.smartContract.tx_id,
          sender_address: metadataBundle?.smartContract.principal.split('.')[0],
          image_uri: metadataBundle?.metadataLocale?.metadata?.cached_image ?? undefined,
          image_canonical_uri: metadataBundle?.metadataLocale?.metadata?.image ?? undefined,
          metadata: parseMetadataLocaleBundle(metadataBundle?.metadataLocale),
        });
      } catch (error) {
        await generateTokenErrorResponse(error, reply);
      }
    }
  );
  done();
};

export const FtRoutes: FastifyPluginAsync<
  Record<never, never>,
  Server,
  TypeBoxTypeProvider
> = async fastify => {
  await fastify.register(IndexRoutes);
  await fastify.register(ShowRoutes);
};

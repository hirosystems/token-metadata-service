/**
 * Token Metadata API
 * Service that indexes metadata for every SIP-009, SIP-010, and SIP-013 Token in the Stacks blockchain and exposes it via REST API endpoints.
 *
 * OpenAPI spec version: v0.3.0
 * 
 *
 * NOTE: This file is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the file manually.
 */

import * as api from "./api"
import { Configuration } from "./configuration"

const config: Configuration = {}

describe("StatusApi", () => {
  let instance: api.StatusApi
  beforeEach(function() {
    instance = new api.StatusApi(config)
  });

  test("getApiStatus", () => {
    return expect(instance.getApiStatus({})).resolves.toBe(null)
  })
})

describe("TokensApi", () => {
  let instance: api.TokensApi
  beforeEach(function() {
    instance = new api.TokensApi(config)
  });

  test("getFtMetadata", () => {
    const principal: string = "principal_example"
    const locale: string = "locale_example"
    return expect(instance.getFtMetadata(principal, locale, {})).resolves.toBe(null)
  })
  test("getFungibleTokens", () => {
    const name: string = "name_example"
    const symbol: string = "symbol_example"
    const address: string = "address_example"
    const offset: number = 56
    const limit: number = 56
    const order_by: api.OrderBy = undefined
    const order: api.Order = undefined
    return expect(instance.getFungibleTokens(name, symbol, address, offset, limit, order_by, order, {})).resolves.toBe(null)
  })
  test("getNftMetadata", () => {
    const principal: string = "principal_example"
    const token_id: number = 56
    const locale: string = "locale_example"
    return expect(instance.getNftMetadata(principal, token_id, locale, {})).resolves.toBe(null)
  })
  test("getSftMetadata", () => {
    const principal: string = "principal_example"
    const token_id: number = 56
    const locale: string = "locale_example"
    return expect(instance.getSftMetadata(principal, token_id, locale, {})).resolves.toBe(null)
  })
})


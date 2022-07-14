import { ChainID, ClarityAbi } from '@stacks/transactions';
import { BlockchainDbSmartContract, PgBlockchainApiStore } from "../pg/blockchain-api/pg-blockchain-api-store";
import { PgStore } from "../pg/pg-store";
import { DbSipNumber, DbSmartContract } from "../pg/types";
import { SmartContractQueue } from './queue/smart-contract-queue';
import { getSmartContractSip } from './util/sip-validation';

/**
 * Scans the `smart_contracts` table in the Stacks Blockchain API postgres DB for every smart
 * contract that exists in the blockchain. It then takes all of them which declare tokens and
 * enqueues them for processing.
 */
export class BlockchainSmartContractImporter {
  private readonly db: PgStore;
  private readonly apiDb: PgBlockchainApiStore;
  private readonly smartContractQueue: SmartContractQueue;
  private readonly chainId: ChainID;

  constructor(args: {
    db: PgStore,
    apiDb: PgBlockchainApiStore,
    smartContractQueue: SmartContractQueue,
    chainId: ChainID
  }) {
    this.db = args.db;
    this.apiDb = args.apiDb;
    this.smartContractQueue = args.smartContractQueue;
    this.chainId = args.chainId;
  }

  async importSmartContracts() {
    // There could be thousands of contracts. We'll use a cursor to iterate.
    const cursor = await this.apiDb.getSmartContractsCursor({ afterBlockHeight: 1 });
    for await (const [row] of cursor) {
      const sip = getSmartContractSip(row.abi as ClarityAbi);
      if (!sip) {
        continue; // Not a token contract.
      }
      // FIXME: Do these at the same time
      const smartContract = await this.insertSmartContract(row, sip);
      await this.enqueueSmartContract(smartContract);
      console.info(`Importing token contract (${sip}): ${row.contract_id}`);
    }
  }

  private async insertSmartContract(blockchainContract: BlockchainDbSmartContract, sip: DbSipNumber) {
    return await this.db.insertSmartContract({
      values: {
        principal: blockchainContract.contract_id,
        sip: sip,
        abi: JSON.stringify(blockchainContract.abi),
        tx_id: blockchainContract.tx_id,
        block_height: blockchainContract.block_height
      }
    });
  }

  private async enqueueSmartContract(smartContract: DbSmartContract) {
    const entry = await this.db.insertSmartContractQueueEntry({
      values: {
        smart_contract_id: smartContract.id
      }
    });
    this.smartContractQueue.add(entry);
  }
}

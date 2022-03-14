import { Transaction } from '@metaplex-foundation/mpl-core';
import {
  Auction,
  AuctionExtended,
} from '@metaplex-foundation/mpl-auction';
import { EndAuction, AuctionManager } from '@metaplex-foundation/mpl-metaplex'
import { PublicKey, TransactionSignature } from '@solana/web3.js';

import { Wallet } from '../../wallet';
import { Connection } from '../../Connection';
import { sendTransaction } from '../transactions';
import { TransactionsBatch } from '../../utils/transactions-batch';

import BN from 'bn.js';

interface EndAuctionParams {

  connection: Connection;
  wallet: Wallet;
  auction: PublicKey;
  store: PublicKey;
  reveal?: BN[];
}

interface EndAuctionResponse {
  txId: TransactionSignature;
}

export const endAuction = async ({
  connection,
  wallet,
  auction,
  store,
}: EndAuctionParams): Promise<EndAuctionResponse> => {

  const txOptions = { feePayer: wallet.publicKey };

  const auctionManager = await AuctionManager.getPDA(auction);
  const manager = await AuctionManager.load(connection, auctionManager);
  const vault = new PublicKey(manager.data.vault);
  const auctionKey = await Auction.getPDA(vault)
  const auctionExtended = await AuctionExtended.getPDA(vault);
  const auctionManagerAuthority = new PublicKey(manager.data.authority)

  const txBatch = new TransactionsBatch({ transactions: [] });

  const auctionTx = new EndAuction(txOptions, {
    auction: auctionKey,
    store,
    auctionManager,
    auctionExtended,
    auctionManagerAuthority
  });

  txBatch.addTransaction(auctionTx);

  const txId = await sendTransaction({
    connection,
    signers: txBatch.signers,
    txs: txBatch.toTransactions(),
    wallet,
  });

  return { txId };
};

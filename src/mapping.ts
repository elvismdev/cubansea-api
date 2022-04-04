import {
  MarketTokenMinted as MarketTokenMintedEvent,
  MarketTokenSold as MarketTokenSoldEvent,
} from "../generated/CSMarket/CSMarket";
import { MarketTokenMinted, MarketTokenSold } from "../generated/schema";
import { fetchERC721, fetchERC721Token } from "./fetch/erc721";
import { fetchAccount } from "@openzeppelin/subgraphs/src/fetch/account";

export function handleMarketTokenMinted(event: MarketTokenMintedEvent): void {
  let entity = new MarketTokenMinted(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity.itemId = event.params.itemId;
  entity.nftContract = event.params.nftContract;
  entity.tokenId = event.params.tokenId;
  entity.seller = event.params.seller;
  entity.owner = event.params.owner;
  entity.price = event.params.price;
  entity.sold = event.params.sold;

  // Add token price and seller values to new .price and .seller fields in the ERC721Token type.
  let contract = fetchERC721(event.params.nftContract);
  if (contract != null) {
    let token = fetchERC721Token(contract, event.params.tokenId);
    let seller = fetchAccount(event.params.seller);

    token.price = event.params.price;
    token.seller = seller.id;

    contract.save();
    token.save();
  }

  entity.save();
}

export function handleMarketTokenSold(event: MarketTokenSoldEvent): void {
  let entity = new MarketTokenSold(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity.itemId = event.params.itemId;
  entity.nftContract = event.params.nftContract;
  entity.tokenId = event.params.tokenId;
  entity.seller = event.params.seller;
  entity.owner = event.params.owner;
  entity.price = event.params.price;
  entity.sold = event.params.sold;
  entity.save();
}
